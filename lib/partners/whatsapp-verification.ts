import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { startPhoneVerification, checkPhoneVerification } from "@/lib/sms/twilio";

// ---------------------------------------------------------------------------
// Verificação real de WhatsApp/telefone via Twilio Verify. Diferente da
// verificação de e-mail (CPF Brasil e Resend), o código em si NUNCA passa
// pelo nosso banco — quem gera, armazena (com expiração) e confere é a
// própria Twilio. A gente só guarda o resultado (aprovado ou não) e audita
// as tentativas, sem nunca logar o código digitado.
// ---------------------------------------------------------------------------

const MAX_SENDS_PER_WINDOW = 3;
const MAX_CHECKS_PER_WINDOW = 8;
const RATE_WINDOW_MINUTES = 15;
const AUDIT_ACTION_SENT = "partner_whatsapp_otp_sent";
const AUDIT_ACTION_SEND_FAILED = "partner_whatsapp_otp_send_failed";
const AUDIT_ACTION_VERIFIED = "partner_whatsapp_verified";
const AUDIT_ACTION_FAILED_ATTEMPT = "partner_whatsapp_otp_failed_attempt";

/** Mascara um telefone E.164 pra auditoria: +5511987654321 -> +55 (11) ****-4321 */
function maskPhone(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  const last4 = digits.slice(-4);
  const ddd = digits.slice(2, 4);
  return `+55 (${ddd}) ****-${last4}`;
}

async function countRecentAuditActions(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  actions: string[]
): Promise<number> {
  const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await supabaseAdmin
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("entity_type", "partner")
    .eq("entity_id", partnerId)
    .in("action", actions)
    .gte("created_at", windowStart);
  return count ?? 0;
}

export type SendWhatsappOtpOutcome = { sent: true } | { sent: false; reason: string; rateLimited?: boolean };

/** Inicia (ou reinicia) a verificação real do número de WhatsApp atual do parceiro. */
export async function sendPartnerWhatsappCode(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  phoneE164: string,
  actor: { id: string | null; role: string | null }
): Promise<SendWhatsappOtpOutcome> {
  const recentSends = await countRecentAuditActions(supabaseAdmin, partnerId, [AUDIT_ACTION_SENT]);
  if (recentSends >= MAX_SENDS_PER_WINDOW) {
    return { sent: false, reason: "Muitos códigos solicitados. Tente novamente em alguns minutos.", rateLimited: true };
  }

  const result = await startPhoneVerification(phoneE164);
  if (!result.ok) {
    await logAudit(supabaseAdmin, {
      actorId: actor.id,
      actorRole: actor.role,
      action: AUDIT_ACTION_SEND_FAILED,
      entityType: "partner",
      entityId: partnerId,
      metadata: { phone: maskPhone(phoneE164) },
    });
    return { sent: false, reason: result.reason };
  }

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_SENT,
    entityType: "partner",
    entityId: partnerId,
    metadata: { phone: maskPhone(phoneE164), status: result.status },
  });

  return { sent: true };
}

export type CheckWhatsappOtpOutcome =
  | { status: "verified" }
  | { status: "invalid"; reason: string }
  | { status: "rate_limited"; reason: string };

/** Confere o código digitado contra a verificação pendente na Twilio pra esse número. */
export async function checkPartnerWhatsappCode(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  phoneE164: string,
  code: string,
  actor: { id: string | null; role: string | null }
): Promise<CheckWhatsappOtpOutcome> {
  const recentChecks = await countRecentAuditActions(supabaseAdmin, partnerId, [
    AUDIT_ACTION_FAILED_ATTEMPT,
    AUDIT_ACTION_VERIFIED,
  ]);
  if (recentChecks >= MAX_CHECKS_PER_WINDOW) {
    return { status: "rate_limited", reason: "Muitas tentativas. Peça um novo código e tente novamente em instantes." };
  }

  const result = await checkPhoneVerification(phoneE164, code);
  if (!result.ok) {
    return { status: "invalid", reason: result.reason };
  }

  if (result.status !== "approved") {
    await logAudit(supabaseAdmin, {
      actorId: actor.id,
      actorRole: actor.role,
      action: AUDIT_ACTION_FAILED_ATTEMPT,
      entityType: "partner",
      entityId: partnerId,
      metadata: { phone: maskPhone(phoneE164), status: result.status },
    });
    const reason =
      result.status === "expired" || result.status === "max_attempts_reached"
        ? "Código expirado ou com tentativas esgotadas. Peça um novo código."
        : "Código inválido. Tente de novo.";
    return { status: "invalid", reason };
  }

  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("partners")
    .update({ whatsapp_verified: true, whatsapp_verified_at: now })
    .eq("id", partnerId);
  if (error) {
    // Nunca logar telefone/CPF/e-mail/token/código — só o motivo técnico do
    // Postgrest, pra diagnosticar sem adivinhar.
    console.error(
      `[whatsapp-verification] update em partners falhou: code=${error.code ?? "?"} message=${error.message} details=${error.details ?? "?"} hint=${error.hint ?? "?"}`
    );
    return { status: "invalid", reason: "Código confirmado, mas houve um erro ao salvar. Tente novamente." };
  }

  await logAudit(supabaseAdmin, {
    actorId: actor.id,
    actorRole: actor.role,
    action: AUDIT_ACTION_VERIFIED,
    entityType: "partner",
    entityId: partnerId,
    metadata: { phone: maskPhone(phoneE164) },
  });

  await recomputePartnerEligibility(supabaseAdmin, partnerId, actor);

  return { status: "verified" };
}
