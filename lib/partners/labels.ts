import type { CustomerStatus, PayoutStatus, ServiceKey } from "@/lib/supabase/types";

export const SERVICE_LABELS: Record<ServiceKey, string> = {
  passeios: "🐕 Dog Walker / Passeios",
  socializacao: "🐾 Socialização",
  pet_sitter: "🏡 Pet Sitter",
  creche: "🧸 Creche",
  hotel: "🏨 Hotel Pet",
  vacinas: "💉 Vacinas a domicílio",
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  indicado: "Indicado",
  em_contato: "Em contato",
  em_negociacao: "Em negociação",
  fechado: "Fechado",
  cancelado: "Cancelado",
  nao_convertido: "Não convertido",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  solicitado: "Solicitado",
  em_analise: "Em análise",
  aprovado: "Aprovado",
  pago: "Pago",
  recusado: "Recusado",
};

export function formatCustomerLabel(sequenceNumber: number): string {
  return `Cliente #${String(sequenceNumber).padStart(4, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}
