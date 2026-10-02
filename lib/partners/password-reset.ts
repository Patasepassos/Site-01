import "server-only";
import { createHash, randomBytes, randomInt } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PartnerPasswordResetRow } from "@/lib/supabase/types";
import { logAudit } from "@/lib/partners/audit";
import { describeError } from "@/lib/partners/errors";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { sendEmail } from "@/lib/email/resend";
import { normalizeToE164BR } from "@/lib/partners/phone";
import { startPhoneVerification, checkPhoneVerification } from "@/lib/sms/twilio";
import { validatePasswordPolicy } from "@/lib/partners/password-policy";

// ---------------------------------------------------------------------------
// Recuperação de senha por código, sem link nenhum pra clicar. Substitui o
// resetPasswordForEmail (magic link) do Supabase, que falhava com frequência
// -- e-mail na caixa de spam, link expirado, ou o redirect URL cadastrado no
// Supabase não batendo com o domínio atual.
//
// Fluxo: 1) código de 6 dígitos por e-mail (Resend)  2) código por SMS
// (Twilio Verify -- confirma de quebra que o número é real)  3) nova senha
// na mesma tela. Um token opaco (nunca salvo em texto puro) amarra as 3
// etapas, já que não existe sessão autenticada até a senha ser trocada.
// ---------------------------------------------------------------------------

const TOKEN_TTL_MINUTES = 20;
const EMAIL_CODE_TTL_MINUTES = 10;
const MAX_EMAIL_ATTEMPTS = 5;
const MAX_REQUESTS_PER_WINDOW = 3;
const REQUEST_WINDOW_MINUTES = 15;

const AUDIT_REQUESTED = "partner_password_reset_requested";
const AUDIT_EMAIL_VERIFIED = "partner_password_reset_email_verified";
const AUDIT_EMAIL_FAILED = "partner_password_reset_email_failed_attempt";
const AUDIT_SMS_SENT = "partner_password_reset_sms_sent";
const AUDIT_SMS_SKIPPED = "partner_password_reset_sms_skipped";
const AUDIT_SMS_FAILED = "partner_password_reset_sms_failed_attempt";
const AUDIT_SMS_VERIFIED = "partner_password_reset_sms_verified";
const AUDIT_COMPLETED = "partner_password_reset_completed";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

async function findResetByToken(
  supabaseAdmin: SupabaseClient<Database>,
  token: string
): Promise<PartnerPasswordResetRow | null> {
  const { data } = await supabaseAdmin
    .from("partner_password_resets")
    .select("*")
    .eq("token_hash", hashToken(token))
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
  return data;
}

export type RequestPasswordResetResult = { token: string };

/**
 * Sempre devolve um token, exista ou não esse e-mail cadastrado -- nunca
 * revela se o e-mail existe (mesma garantia que o fluxo antigo já tinha).
 * Só cria registro de verdade e manda código quando o e-mail bate com um
 * parceiro ativo (não removido).
 */
export async function requestPartnerPasswordReset(
  supabaseAdmin: SupabaseClient<Database>,
  rawEmail: string
): Promise<RequestPasswordResetResult> {
  const token = generateToken();
  const email = rawEmail.trim().toLowerCase();

  // generateLink nunca envia e-mail (isso é só do resetPasswordForEmail) --
  // aqui serve puramente pra resolver e-mail -> usuário, sem precisar
  // paginar todos os usuários pra achar por e-mail.
  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({ type: "recovery", email });
  const userId = linkData?.user?.id;
  if (!userId) return { token };

  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("id, profile_id, account_deleted_at")
    .eq("profile_id", userId)
    .maybeSingle();
  if (!partner || partner.account_deleted_at) return { token };

  const windowStart = new Date(Date.now() - REQUEST_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("partner_password_resets")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partner.id)
    .gte("created_at", windowStart);
  if ((count ?? 0) >= MAX_REQUESTS_PER_WINDOW) return { token };

  const code = generateOtpCode();
  const now = Date.now();

  const { error: insertError } = await supabaseAdmin.from("partner_password_resets").insert({
    partner_id: partner.id,
    profile_id: partner.profile_id,
    email,
    token_hash: hashToken(token),
    email_code_hash: hashOtpCode(code),
    email_code_expires_at: new Date(now + EMAIL_CODE_TTL_MINUTES * 60_000).toISOString(),
    expires_at: new Date(now + TOKEN_TTL_MINUTES * 60_000).toISOString(),
  });
  if (insertError) return { token };

  try {
    await sendEmail({
      to: email,
      subject: "Código para redefinir sua senha — Patas & Passos",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Redefinir senha 🐾</h2>
          <p>Use o código abaixo para continuar a redefinição da sua senha na Área de Parceiro da Patas &amp; Passos:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center;">${code}</p>
          <p>Esse código expira em ${EMAIL_CODE_TTL_MINUTES} minutos e só pode ser usado uma vez.</p>
          <p style="color: #888; font-size: 13px;">Se você não pediu essa redefinição, pode ignorar este e-mail -- sua senha continua a mesma.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[password-reset] falha ao enviar e-mail via Resend:", describeError(err));
    // Não revela a falha de envio pro cliente -- o comportamento externo
    // continua "se esse e-mail estiver cadastrado, você vai receber o código".
  }

  await logAudit(supabaseAdmin, {
    actorId: null,
    actorRole: null,
    action: AUDIT_REQUESTED,
    entityType: "partner",
    entityId: partner.id,
  });

  return { token };
}

export type VerifyOutcome = { status: "verified" } | { status: "invalid"; reason: string } | { status: "rate_limited"; reason: string };

export async function verifyPasswordResetEmailCode(
  supabaseAdmin: SupabaseClient<Database>,
  token: string,
  code: string
): Promise<VerifyOutcome> {
  const reset = await findResetByToken(supabaseAdmin, token);
  if (!reset) return { status: "invalid", reason: "Sessão de recuperação expirada. Comece de novo." };
  if (reset.email_verified_at) return { status: "verified" };

  if (new Date(reset.email_code_expires_at).getTime() < Date.now()) {
    return { status: "invalid", reason: "Código expirado. Peça um novo código." };
  }
  if (reset.email_code_attempts >= MAX_EMAIL_ATTEMPTS) {
    return { status: "rate_limited", reason: "Muitas tentativas com esse código. Comece a recuperação de novo." };
  }

  if (hashOtpCode(code) !== reset.email_code_hash) {
    const attempts = reset.email_code_attempts + 1;
    await supabaseAdmin.from("partner_password_resets").update({ email_code_attempts: attempts }).eq("id", reset.id);
    await logAudit(supabaseAdmin, {
      actorId: null,
      actorRole: null,
      action: AUDIT_EMAIL_FAILED,
      entityType: "partner",
      entityId: reset.partner_id,
      metadata: { attempts },
    });
    return { status: "invalid", reason: "Código inválido. Tente de novo." };
  }

  await supabaseAdmin
    .from("partner_password_resets")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", reset.id);

  await logAudit(supabaseAdmin, {
    actorId: null,
    actorRole: null,
    action: AUDIT_EMAIL_VERIFIED,
    entityType: "partner",
    entityId: reset.partner_id,
  });

  return { status: "verified" };
}

export type SendPhoneCodeOutcome = { sent: true } | { sent: false; skipped: boolean; reason: string };

/**
 * Dispara o código por SMS pro telefone cadastrado. Se não der (sem telefone
 * válido, Twilio fora do ar, conta trial sem o número verificado etc.),
 * marca a etapa como "pulada" -- nunca trava o parceiro fora da própria
 * conta por causa de um provedor terceiro; ele segue só com o e-mail.
 */
export async function sendPasswordResetPhoneCode(
  supabaseAdmin: SupabaseClient<Database>,
  token: string
): Promise<SendPhoneCodeOutcome> {
  const reset = await findResetByToken(supabaseAdmin, token);
  if (!reset || !reset.email_verified_at) {
    return { sent: false, skipped: false, reason: "Confirme o código do e-mail antes de continuar." };
  }
  if (reset.phone_verified_at) return { sent: true };

  const { data: profile } = await supabaseAdmin.from("profiles").select("phone").eq("id", reset.profile_id).maybeSingle();
  const phoneE164 = profile?.phone ? normalizeToE164BR(profile.phone) : null;
  if (!phoneE164) {
    await supabaseAdmin.from("partner_password_resets").update({ phone_skipped: true }).eq("id", reset.id);
    return { sent: false, skipped: true, reason: "Nenhum número de WhatsApp válido cadastrado -- etapa de SMS pulada." };
  }

  const result = await startPhoneVerification(phoneE164);
  if (!result.ok) {
    await supabaseAdmin.from("partner_password_resets").update({ phone_skipped: true }).eq("id", reset.id);
    await logAudit(supabaseAdmin, {
      actorId: null,
      actorRole: null,
      action: AUDIT_SMS_SKIPPED,
      entityType: "partner",
      entityId: reset.partner_id,
      metadata: { reason: result.reason },
    });
    return { sent: false, skipped: true, reason: result.reason };
  }

  await supabaseAdmin.from("partner_password_resets").update({ phone_e164: phoneE164 }).eq("id", reset.id);
  await logAudit(supabaseAdmin, {
    actorId: null,
    actorRole: null,
    action: AUDIT_SMS_SENT,
    entityType: "partner",
    entityId: reset.partner_id,
  });

  return { sent: true };
}

export async function verifyPasswordResetPhoneCode(
  supabaseAdmin: SupabaseClient<Database>,
  token: string,
  code: string
): Promise<VerifyOutcome> {
  const reset = await findResetByToken(supabaseAdmin, token);
  if (!reset || !reset.email_verified_at) {
    return { status: "invalid", reason: "Confirme o código do e-mail antes de continuar." };
  }
  if (reset.phone_verified_at) return { status: "verified" };
  if (!reset.phone_e164) return { status: "invalid", reason: "Peça o código por SMS antes de digitar." };

  const result = await checkPhoneVerification(reset.phone_e164, code);
  if (!result.ok) return { status: "invalid", reason: result.reason };

  if (result.status !== "approved") {
    await logAudit(supabaseAdmin, {
      actorId: null,
      actorRole: null,
      action: AUDIT_SMS_FAILED,
      entityType: "partner",
      entityId: reset.partner_id,
      metadata: { status: result.status },
    });
    const reason =
      result.status === "expired" || result.status === "max_attempts_reached"
        ? "Código expirado ou com tentativas esgotadas. Peça um novo código."
        : "Código inválido. Tente de novo.";
    return { status: "invalid", reason };
  }

  const now = new Date().toISOString();
  await supabaseAdmin.from("partner_password_resets").update({ phone_verified_at: now }).eq("id", reset.id);

  // Bônus: isso É uma verificação real do número via Twilio -- se o parceiro
  // ainda não tinha o WhatsApp confirmado, aproveita e confirma agora,
  // exatamente o "saber se o número dela é verídico" que motivou essa etapa.
  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("whatsapp_verified")
    .eq("id", reset.partner_id)
    .maybeSingle();
  if (partner && !partner.whatsapp_verified) {
    await supabaseAdmin
      .from("partners")
      .update({ whatsapp_verified: true, whatsapp_verified_at: now })
      .eq("id", reset.partner_id);
    await recomputePartnerEligibility(supabaseAdmin, reset.partner_id, { id: null, role: null });
  }

  await logAudit(supabaseAdmin, {
    actorId: null,
    actorRole: null,
    action: AUDIT_SMS_VERIFIED,
    entityType: "partner",
    entityId: reset.partner_id,
  });

  return { status: "verified" };
}

export type CompleteResetOutcome = { success: true } | { success: false; reason: string };

export async function completePartnerPasswordReset(
  supabaseAdmin: SupabaseClient<Database>,
  token: string,
  newPassword: string
): Promise<CompleteResetOutcome> {
  const reset = await findResetByToken(supabaseAdmin, token);
  if (!reset) return { success: false, reason: "Sessão de recuperação expirada. Comece de novo." };
  if (!reset.email_verified_at) return { success: false, reason: "Confirme o código do e-mail antes de continuar." };
  if (!reset.phone_verified_at && !reset.phone_skipped) {
    return { success: false, reason: "Conclua a verificação por SMS antes de continuar." };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("full_name, phone")
    .eq("id", reset.profile_id)
    .maybeSingle();

  const policyError = validatePasswordPolicy(newPassword, {
    fullName: profile?.full_name ?? "",
    email: reset.email,
    phone: profile?.phone ?? "",
  });
  if (policyError) return { success: false, reason: policyError };

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(reset.profile_id, {
    password: newPassword,
  });
  if (updateError) {
    return { success: false, reason: "Não foi possível redefinir a senha agora. Tente novamente." };
  }

  await supabaseAdmin
    .from("partner_password_resets")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", reset.id);

  await logAudit(supabaseAdmin, {
    actorId: null,
    actorRole: null,
    action: AUDIT_COMPLETED,
    entityType: "partner",
    entityId: reset.partner_id,
  });

  return { success: true };
}
