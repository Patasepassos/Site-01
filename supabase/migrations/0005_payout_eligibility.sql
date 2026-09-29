-- Patas & Passos — Portal do Parceiro
-- Elegibilidade de pagamento ("Apto para pagamento") e idempotência real de
-- saque. Rode DEPOIS de 0001..0004.

-- ---------------------------------------------------------------------------
-- Verificações que compõem "Apto para pagamento". E-mail é lido direto de
-- auth.users.email_confirmed_at (não duplicado aqui). CPF/CNPJ é validado
-- por dígito verificador no cadastro — document_verified nasce true pra
-- quem passou por lá.
-- ---------------------------------------------------------------------------
alter table public.partners add column if not exists whatsapp_verified boolean not null default false;
alter table public.partners add column if not exists document_verified boolean not null default false;
alter table public.partners add column if not exists financial_data_verified boolean not null default false;
alter table public.partners add column if not exists payout_eligible boolean not null default false;
alter table public.partners add column if not exists eligibility_updated_at timestamptz;

-- Backfill: quem já passou pelo cadastro teve o CPF/CNPJ validado por
-- dígito verificador, e quem já está 'active' já foi revisado pelo admin.
update public.partners set document_verified = true where document_verified = false;
update public.partners set financial_data_verified = true where status = 'active' and financial_data_verified = false;

create index if not exists partners_payout_eligible_idx on public.partners(payout_eligible);

-- ---------------------------------------------------------------------------
-- payouts: identificador da transação (informado pelo admin, ex.: código do
-- comprovante Pix) e chave de idempotência (gerada pelo cliente ao abrir o
-- modal de confirmação) — evita registrar o mesmo pagamento duas vezes por
-- causa de duplo clique ou retry de rede.
-- ---------------------------------------------------------------------------
alter table public.payouts add column if not exists transaction_reference text;
alter table public.payouts add column if not exists idempotency_key text;

-- ---------------------------------------------------------------------------
-- partner_notifications ganha o tipo 'elegibilidade_atualizada'.
-- ---------------------------------------------------------------------------
alter table public.partner_notifications drop constraint if exists partner_notifications_type_check;
alter table public.partner_notifications add constraint partner_notifications_type_check
  check (type in ('indicacao_convertida', 'comissao_liberada', 'saque_atualizado', 'elegibilidade_atualizada'));
