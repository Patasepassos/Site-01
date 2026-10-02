import type {
  CommissionStatus,
  CustomerStatus,
  PartnerStatus,
  PaymentStatus,
  PayoutStatus,
  ServiceKey,
} from "@/lib/supabase/types";

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  passeios: "🐕 Dog Walker / Passeios",
  socializacao: "🐾 Socialização",
  pet_sitter: "🏡 Pet Sitter",
  creche: "🧸 Creche",
  hotel: "🏨 Hotel Pet",
  vacinas: "💉 Vacinas a domicílio",
};

export const SERVICE_KEYS = Object.keys(SERVICE_LABELS) as ServiceKey[];

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  indicado: "Indicado",
  em_contato: "Em contato",
  em_negociacao: "Em negociação",
  servico_contratado: "Serviço contratado",
  fechado: "Fechado",
  cancelado: "Cancelado",
  nao_convertido: "Não convertido",
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  pending: "Aguardando aprovação",
  active: "Ativo",
  blocked: "Bloqueado",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  solicitado: "Solicitado",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  pago: "Pago",
  recusado: "Recusado",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: "Pagamento pendente",
  confirmado: "Pagamento confirmado",
  cancelado: "Pagamento cancelado",
};

/**
 * Status único (emoji + texto) do fluxo pedido pra tela de fechamento via
 * WhatsApp: Indicação recebida -> Em negociação -> Pagamento pendente ->
 * Comissão pendente -> Comissão liberada -> Comissão paga, com Cancelada em
 * qualquer ponto. Combina o status do cliente, o status do pagamento da
 * venda e o status da comissão sem precisar de um novo enum único no banco.
 */
export function getUnifiedStatus(params: {
  customerStatus: CustomerStatus;
  paymentStatus?: PaymentStatus | null;
  commissionStatus?: CommissionStatus | null;
}): { emoji: string; label: string; tone: "pending" | "progress" | "done" | "paid" | "cancelled" } {
  const { customerStatus, paymentStatus, commissionStatus } = params;

  if (customerStatus === "cancelado") return { emoji: "❌", label: "Cancelada", tone: "cancelled" };
  if (customerStatus === "nao_convertido") return { emoji: "❌", label: "Não convertido", tone: "cancelled" };
  if (customerStatus === "indicado") return { emoji: "🟡", label: "Indicação recebida", tone: "pending" };
  if (customerStatus === "em_contato" || customerStatus === "em_negociacao") {
    return { emoji: "🔵", label: "Em negociação", tone: "progress" };
  }
  if (customerStatus === "servico_contratado") {
    return { emoji: "✅", label: "Serviço contratado", tone: "progress" };
  }

  // customerStatus === "fechado"
  if (paymentStatus === "cancelado") return { emoji: "❌", label: "Cancelada", tone: "cancelled" };
  if (!paymentStatus || paymentStatus === "pendente") {
    return { emoji: "🟠", label: "Pagamento pendente", tone: "pending" };
  }

  if (commissionStatus === "paga") return { emoji: "💰", label: "Comissão paga", tone: "paid" };
  if (commissionStatus === "liberada") return { emoji: "✅", label: "Comissão liberada", tone: "done" };
  return { emoji: "🟣", label: "Comissão pendente", tone: "progress" };
}

// Rótulos pro Histórico de ações (audit_logs) na ficha do parceiro no admin --
// só as ações que têm entity_type "partner". Qualquer ação nova que a gente
// esquecer de listar aqui ainda aparece (cai no fallback = o próprio action).
export const PARTNER_AUDIT_ACTION_LABELS: Record<string, string> = {
  partner_signup: "📝 Cadastro realizado",
  partner_status_updated: "🔐 Status alterado",
  partner_profile_updated: "✏️ Perfil atualizado",
  partner_name_updated: "✏️ Nome atualizado",
  partner_avatar_changed: "🖼️ Avatar alterado",
  partner_account_deleted: "👋 Conta excluída (autoexclusão)",
  partner_eligibility_changed: "✅ Elegibilidade de pagamento recalculada",
  partner_whatsapp_verified_updated: "📱 Verificação de WhatsApp alterada",
  partner_financial_data_reviewed: "💳 Dados financeiros (Pix) revisados",
  partner_test_flag_updated: "🧪 Marcação de teste alterada",
  partner_service_area_updated: "📍 Região de atendimento atualizada",
};

export function formatCustomerLabel(sequenceNumber: number): string {
  return `Cliente #${String(sequenceNumber).padStart(4, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
