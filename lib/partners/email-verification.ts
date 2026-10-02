import "server-only";
import { createHash, randomInt } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { logAudit } from "@/lib/partners/audit";
import { describeError } from "@/lib/partners/errors";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { sendEmail } from "@/lib/email/resend";

// ---------------------------------------------------------------------------
// Verificação real de e-mail: código de 6 dígitos por Resend, hash (nunca
// texto puro) com expiração curta e uso único. A proteção contra força
// bruta vem do limite de tentativas + expiração — não da força do hash —
// então SHA-256 simples é suficiente aqui (quem tem acesso direto ao banco
// pra tentar quebrar o hash já poderia alterar o status direto).
// ---------------------------------------------------------------------------

const CODE_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_SENDS_PER_WINDOW = 3;
const SEND_WINDOW_MINUTES = 15;
const AUDIT_ACTION_SENT = "partner_email_otp_sent";
const AUDIT_ACTION_VERIFIED = "partner_email_verified";
const AUDIT_ACTION_FAILED_ATTEMPT = "partner_email_otp_failed_attempt";
const AUDIT_ACTION_EMAIL_CHANGED = "partner_email_changed";

function generateOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export type SendOtpOutcome = { sent: true } | { sent: false; reason: string; rateLimited?: boolean };

/**
 * Envia (ou reenvia) o código de verificação pro e-mail atual do parceiro.
 * Invalida qualquer código anterior ainda válido — nunca existe mais de um
 * código ativo por vez.
 */
export async function sendPartnerEmailOtp(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  email: string,
  actor: { id: string | null; role: string | null }
): Promise<SendOtpOutcome> {
  const windowStart = new Date(Date.now() - SEND_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "partner")
    .eq("entity_id", partnerId)
    .eq("action", AUDIT_ACTION_SENT)
    .gte("created_at", windowStart);

  if ((count ?? 0) >= MAX_SENDS_PER_WINDOW) {
    return { sent: false, reason: "Muitos códigos solicitados. Tente novamente em alguns minutos.", rateLimited: true };
  }

  // Invalida qualquer código anterior ainda ativo pra esse parceiro.
  await supabaseAdmin
    .from("partner_email_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("partner_id", partnerId)
    .is("consumed_at", null);

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();

  const { error: insertError } = await supabaseAdmin.from("partner_email_otps").insert({
    partner_id: partnerId,
    email,
    code_hash: hashOtpCode(code),
    expires_at: expiresAt,
  });
  if (insertError) {
    return { sent: false, reason: "Não foi possível gerar o código agora. Tente novamente." };
  }

  try {
    await sendEmail({
      to: email,
      subject: "Seu código de verificação — Patas & Passos",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Confirme seu e-mail 🐾</h2>
          <p>Use o código abaixo para confirmar seu e-mail na Área de Parceiro da Patas &amp; Passos:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; text-align: center;">${code}</p>
          <p>Esse código expira em ${CODE_TTL_MINUTES} minutos e só pode ser usado uma vez.</p>
          <p style="color: #888; font-size: 13px;">Se você não pediu esse código, pode ignorar este e-mail.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de verificação via Resend:", describeError(err));
    return { sent: false, reason: "Não foi possível enviar o código agora. Tente novamente em instantes." };
  }

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_SENT,
    entityType: "partner",
    entityId: partnerId,
    metadata: { email },
  });

  return { sent: true };
}

export type VerifyOtpOutcome =
  | { status: "verified" }
  | { status: "invalid"; reason: string }
  | { status: "rate_limited"; reason: string };

/** Confere o código digitado contra o último código ainda válido do parceiro. */
export async function verifyPartnerEmailOtp(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  code: string,
  actor: { id: string | null; role: string | null }
): Promise<VerifyOtpOutcome> {
  const { data: otp } = await supabaseAdmin
    .from("partner_email_otps")
    .select("*")
    .eq("partner_id", partnerId)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp || new Date(otp.expires_at).getTime() < Date.now()) {
    return { status: "invalid", reason: "Código expirado. Peça um novo código." };
  }

  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
    await supabaseAdmin.from("partner_email_otps").update({ consumed_at: new Date().toISOString() }).eq("id", otp.id);
    return { status: "rate_limited", reason: "Muitas tentativas com esse código. Peça um novo código." };
  }

  if (hashOtpCode(code) !== otp.code_hash) {
    const newAttempts = otp.attempts + 1;
    await supabaseAdmin.from("partner_email_otps").update({ attempts: newAttempts }).eq("id", otp.id);
    await logAudit(supabaseAdmin, {
      actorId: actor.id,
      actorRole: actor.role,
      action: AUDIT_ACTION_FAILED_ATTEMPT,
      entityType: "partner",
      entityId: partnerId,
      metadata: { attempts: newAttempts },
    });
    if (newAttempts >= MAX_VERIFY_ATTEMPTS) {
      await supabaseAdmin.from("partner_email_otps").update({ consumed_at: new Date().toISOString() }).eq("id", otp.id);
      return { status: "rate_limited", reason: "Muitas tentativas com esse código. Peça um novo código." };
    }
    return { status: "invalid", reason: "Código inválido. Tente de novo." };
  }

  const now = new Date().toISOString();
  await supabaseAdmin.from("partner_email_otps").update({ consumed_at: now }).eq("id", otp.id);
  await supabaseAdmin.from("partners").update({ email_verified: true, email_verified_at: now }).eq("id", partnerId);

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_VERIFIED,
    entityType: "partner",
    entityId: partnerId,
    metadata: { email: otp.email },
  });

  await recomputePartnerEligibility(supabaseAdmin, partnerId, actor);

  return { status: "verified" };
}

export type ChangeEmailOutcome = { success: true } | { success: false; reason: string };

/**
 * Troca o e-mail de login do parceiro direto pela Admin API do Supabase —
 * de propósito NÃO usa `auth.updateUser` (client), que dispara o fluxo
 * nativo de dupla confirmação do Supabase por e-mail. Aqui a única
 * verificação que existe é a nossa, via Resend — evita duas verificações
 * concorrentes pro mesmo e-mail.
 */
export async function changePartnerEmail(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  profileId: string,
  newEmail: string,
  actor: { id: string | null; role: string | null }
): Promise<ChangeEmailOutcome> {
  const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profileId, {
    email: newEmail,
    email_confirm: true,
  });
  if (updateError || !updated.user) {
    return {
      success: false,
      reason: updateError?.message.includes("already been registered")
        ? "Este e-mail já está em uso por outra conta."
        : "Não foi possível alterar o e-mail agora.",
    };
  }

  const { error: partnerError } = await supabaseAdmin
    .from("partners")
    .update({ email_verified: false, email_verified_at: null })
    .eq("id", partnerId);
  if (partnerError) {
    return { success: false, reason: "E-mail alterado, mas houve erro ao atualizar a verificação. Contate o suporte." };
  }

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_EMAIL_CHANGED,
    entityType: "partner",
    entityId: partnerId,
    metadata: { newEmail },
  });

  await recomputePartnerEligibility(supabaseAdmin, partnerId, actor);
  await sendPartnerEmailOtp(supabaseAdmin, partnerId, newEmail, actor);

  return { success: true };
}
