import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PartnerRow } from "@/lib/supabase/types";
import { onlyDigits } from "@/lib/partners/validation";
import { logAudit } from "./audit";

export type EligibilityChecklist = {
  emailVerified: boolean;
  whatsappVerified: boolean;
  documentVerified: boolean;
  financialDataVerified: boolean;
  partnerActive: boolean;
  eligible: boolean;
};

/**
 * "Apto para pagamento" exige TODOS os requisitos ao mesmo tempo. E-mail
 * vem de auth.users.email_confirmed_at (nunca duplicado no nosso banco).
 *
 * CPF/CNPJ: para pessoa física (11 dígitos), `documentVerified` reflete o
 * resultado REAL da verificação automática via API CPF Brasil
 * (`partner.cpf_status === "verified"`) — nunca um placeholder. Para CNPJ
 * (14 dígitos) não existe verificação automática contratada, então continua
 * dependendo da aprovação manual do admin (`partner.document_verified`).
 */
export function buildEligibilityChecklist(partner: PartnerRow, emailVerified: boolean): EligibilityChecklist {
  const partnerActive = partner.status === "active";
  const isCpf = onlyDigits(partner.cpf_cnpj).length === 11;
  const documentVerified = isCpf ? partner.cpf_status === "verified" : partner.document_verified;

  const eligible =
    partnerActive && emailVerified && partner.whatsapp_verified && documentVerified && partner.financial_data_verified;

  return {
    emailVerified,
    whatsappVerified: partner.whatsapp_verified,
    documentVerified,
    financialDataVerified: partner.financial_data_verified,
    partnerActive,
    eligible,
  };
}

/**
 * Recalcula `payout_eligible` a partir do estado atual e grava, se mudou.
 * Chamada sempre que qualquer requisito é alterado: perfil editado (telefone
 * ou Pix), WhatsApp confirmado pelo admin, parceiro aprovado/bloqueado. Uma
 * mudança real (true<->false) gera auditoria e notifica o parceiro — nunca
 * silenciosa.
 */
export async function recomputePartnerEligibility(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  actor: { id: string | null; role: string | null }
): Promise<EligibilityChecklist> {
  const { data: partner, error } = await supabaseAdmin.from("partners").select("*").eq("id", partnerId).maybeSingle();
  if (error || !partner) throw error ?? new Error("Parceiro não encontrado pra recalcular elegibilidade.");

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(partner.profile_id);
  const emailVerified = Boolean(authUser.user?.email_confirmed_at);

  const checklist = buildEligibilityChecklist(partner, emailVerified);

  if (partner.payout_eligible !== checklist.eligible) {
    const { error: updateError } = await supabaseAdmin
      .from("partners")
      .update({ payout_eligible: checklist.eligible, eligibility_updated_at: new Date().toISOString() })
      .eq("id", partnerId);
    if (updateError) throw updateError;

    await logAudit(supabaseAdmin, {
      actorId: actor.id,
      actorRole: actor.role,
      action: "partner_eligibility_changed",
      entityType: "partner",
      entityId: partnerId,
      metadata: { eligible: checklist.eligible, checklist },
    });

    await supabaseAdmin.from("partner_notifications").insert({
      partner_id: partnerId,
      type: "elegibilidade_atualizada",
      message: checklist.eligible
        ? "✅ Seus dados foram aprovados — você está apto a receber pagamentos."
        : "⚠️ Precisamos confirmar seus dados de novo antes de liberar seu próximo pagamento.",
    });
  }

  return checklist;
}
