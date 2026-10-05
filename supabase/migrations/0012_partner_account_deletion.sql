-- Patas & Passos — Portal do Parceiro
-- Autoexclusão de conta do parceiro (anonimização, nunca DELETE de linha).
-- partners.profile_id, customers.partner_id, sales.customer_id etc. têm
-- "on delete cascade" -- apagar a linha de verdade apagaria histórico de
-- vendas/comissões/saques junto. Por isso a exclusão é: banir o usuário no
-- Supabase Auth (impede login, sem tocar nas linhas), anonimizar PII em
-- profiles/partners, marcar status='blocked' + account_deleted_at, e manter
-- customers/sales/commissions/payouts intactos.
-- Rode DEPOIS de 0001..0011.

alter table public.partners add column if not exists account_deleted_at timestamptz;
