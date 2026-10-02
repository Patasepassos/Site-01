-- Patas & Passos — Portal do Parceiro
-- Permite excluir uma conta (auth.users) sem perder histórico. Antes desta
-- migração, excluir um usuário no Supabase Auth falhava com "Database error
-- deleting user" sempre que essa conta aparecia em qualquer log de
-- auditoria, venda, pagamento, regra de comissão ou aprovação de parceiro —
-- essas 6 colunas referenciavam profiles(id) sem nenhuma ação definida
-- (NO ACTION/RESTRICT por padrão no Postgres).
--
-- Esta migração NÃO apaga nenhuma linha de comissão, venda, pagamento,
-- cliente ou log — só troca o que acontece com o PONTEIRO pra conta quando
-- ela é excluída: em vez de bloquear a exclusão, o ponteiro vira NULL e o
-- registro (valor, data, ação, metadata) continua intacto. Nenhuma dessas
-- relações usa CASCADE. RLS e demais políticas não são tocadas.
--
-- Rode DEPOIS de 0001..0007.

-- ---------------------------------------------------------------------------
-- audit_logs.actor_id: o log inteiro (action, actor_role, metadata,
-- created_at) continua existindo — actor_role (coluna de texto separada)
-- já preserva "era admin/operador/parceiro" mesmo sem a conta específica.
-- Já era nullable, nenhuma alteração de NOT NULL necessária.
-- ---------------------------------------------------------------------------
alter table public.audit_logs drop constraint if exists audit_logs_actor_id_fkey;
alter table public.audit_logs
  add constraint audit_logs_actor_id_fkey
  foreign key (actor_id) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- sales.created_by: a venda e o valor continuam intactos. Essa coluna era
-- NOT NULL — precisa virar nullable pra SET NULL funcionar.
-- ---------------------------------------------------------------------------
alter table public.sales alter column created_by drop not null;
alter table public.sales drop constraint if exists sales_created_by_fkey;
alter table public.sales
  add constraint sales_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- payouts.processed_by: o saque, valor e comprovante continuam intactos.
-- Já era nullable.
-- ---------------------------------------------------------------------------
alter table public.payouts drop constraint if exists payouts_processed_by_fkey;
alter table public.payouts
  add constraint payouts_processed_by_fkey
  foreign key (processed_by) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- commission_rules.updated_by: a regra continua ativa/editável, só perde o
-- "editado por". Já era nullable.
-- ---------------------------------------------------------------------------
alter table public.commission_rules drop constraint if exists commission_rules_updated_by_fkey;
alter table public.commission_rules
  add constraint commission_rules_updated_by_fkey
  foreign key (updated_by) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- partners.approved_by: approved_at (a data) continua — só perde "quem
-- aprovou". Já era nullable.
-- ---------------------------------------------------------------------------
alter table public.partners drop constraint if exists partners_approved_by_fkey;
alter table public.partners
  add constraint partners_approved_by_fkey
  foreign key (approved_by) references public.profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- commissions.sale_id: mesmo tratamento que commissions.customer_id já
-- recebe desde a migração 0002 (on delete set null). Fecha a cascata em
-- diamante entre customers->sales (cascade) e partners->commissions
-- (cascade) ao excluir um parceiro com vendas/comissões reais. Já era
-- nullable.
-- ---------------------------------------------------------------------------
alter table public.commissions drop constraint if exists commissions_sale_id_fkey;
alter table public.commissions
  add constraint commissions_sale_id_fkey
  foreign key (sale_id) references public.sales(id) on delete set null;
