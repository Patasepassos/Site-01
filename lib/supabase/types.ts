// Tipos do banco — espelham supabase/migrations/0001_init.sql.
// Mantidos à mão (sem gerar via CLI) porque o projeto não usa Supabase CLI.
// Ao alterar o schema, atualize este arquivo junto.

export type PartnerStatus = "pending" | "active" | "blocked";
export type PixKeyType = "cpf" | "cnpj" | "email" | "telefone" | "aleatoria";
export type ServiceKey = "passeios" | "socializacao" | "pet_sitter" | "creche" | "hotel" | "vacinas";
export type CustomerStatus =
  | "indicado"
  | "em_contato"
  | "em_negociacao"
  | "fechado"
  | "cancelado"
  | "nao_convertido";
export type CommissionRuleType = "meta_clientes" | "recorrencia";
export type ContractType = "avulso" | "mensal" | "anual";
export type CommissionStatus = "bloqueada" | "liberada" | "paga";
export type PayoutStatus = "solicitado" | "em_analise" | "aprovado" | "pago" | "recusado";
export type PaymentStatus = "pendente" | "confirmado" | "cancelado";
export type NotificationType = "indicacao_convertida" | "comissao_liberada" | "saque_atualizado";
export type UserRole = "admin" | "partner";

export type ProfileRow = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  created_at: string;
};

export type PartnerRow = {
  id: string;
  profile_id: string;
  status: PartnerStatus;
  cpf_cnpj: string;
  pix_key: string;
  pix_key_type: PixKeyType;
  coupon_code: string;
  terms_accepted_at: string;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
};

export type CustomerRow = {
  id: string;
  partner_id: string;
  sequence_number: number;
  service: ServiceKey;
  status: CustomerStatus;
  coupon_used: string;
  customer_name: string | null;
  customer_phone: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CommissionRuleRow = {
  id: string;
  name: string;
  service: ServiceKey | null;
  rule_type: CommissionRuleType;
  percentage: number;
  min_clients: number;
  recurring: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

export type SaleRow = {
  id: string;
  customer_id: string;
  service: ServiceKey;
  contract_type: ContractType;
  amount: number;
  payment_method: string | null;
  payment_status: PaymentStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
};

export type PartnerNotificationRow = {
  id: string;
  partner_id: string;
  customer_id: string | null;
  type: NotificationType;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type CommissionRow = {
  id: string;
  partner_id: string;
  rule_id: string;
  sale_id: string | null;
  customer_id: string | null;
  period: string;
  amount: number;
  status: CommissionStatus;
  unlocked_at: string | null;
  created_at: string;
};

export type PayoutRow = {
  id: string;
  partner_id: string;
  amount: number;
  pix_key_snapshot: string;
  status: PayoutStatus;
  requested_at: string;
  processed_by: string | null;
  processed_at: string | null;
};

export type AuditLogRow = {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow>;
      partners: TableDef<PartnerRow>;
      customers: TableDef<CustomerRow>;
      commission_rules: TableDef<CommissionRuleRow>;
      sales: TableDef<SaleRow>;
      commissions: TableDef<CommissionRow>;
      payouts: TableDef<PayoutRow>;
      audit_logs: TableDef<AuditLogRow>;
      partner_notifications: TableDef<PartnerNotificationRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
