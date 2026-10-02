-- Patas & Passos — Portal do Parceiro
-- Fechamento de vendas via WhatsApp: dados do cliente, forma de pagamento,
-- confirmação de pagamento (separada do fechamento da venda) e notificações
-- do parceiro. Rode este arquivo inteiro no SQL Editor do Supabase DEPOIS
-- de já ter rodado 0001_init.sql.

-- ---------------------------------------------------------------------------
-- customers: nome e WhatsApp do cliente indicado. Só o admin acessa esses
-- dois campos (a tela do parceiro nunca seleciona essas colunas) — o
-- parceiro continua vendo só "Cliente #0042".
-- ---------------------------------------------------------------------------
alter table public.customers add column if not exists customer_name text;
alter table public.customers add column if not exists customer_phone text;

-- ---------------------------------------------------------------------------
-- sales: forma de pagamento, observações e o status do PAGAMENTO em si —
-- separado do status do cliente. Uma venda pode estar "fechada" (customers
-- .status = 'fechado') com o pagamento ainda pendente; só quando o admin
-- confirma o pagamento (payment_status = 'confirmado') é que a venda entra
-- no cálculo de comissão.
-- ---------------------------------------------------------------------------
alter table public.sales add column if not exists payment_method text;
alter table public.sales add column if not exists notes text;
alter table public.sales add column if not exists payment_status text
  not null default 'pendente' check (payment_status in ('pendente', 'confirmado', 'cancelado'));

create index if not exists sales_payment_status_idx on public.sales(payment_status);

-- ---------------------------------------------------------------------------
-- commissions.customer_id: denormalizado de propósito. O parceiro pode ler a
-- própria tabela `commissions` (RLS já libera), mas nunca `sales` — sem essa
-- coluna ele não teria como saber qual indicação já tem comissão gerada
-- (ou seja, pagamento confirmado) sem enxergar o valor da venda.
-- ---------------------------------------------------------------------------
alter table public.commissions add column if not exists customer_id uuid references public.customers(id) on delete set null;
create index if not exists commissions_customer_idx on public.commissions(customer_id);

-- ---------------------------------------------------------------------------
-- partner_notifications: alerta automático no painel do parceiro quando uma
-- indicação vira venda. Nunca grava valor em R$ — só o parceiro consultando
-- o próprio saldo/comissão (já liberado ou não) descobre o valor.
-- ---------------------------------------------------------------------------
create table if not exists public.partner_notifications (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  type text not null check (type in ('indicacao_convertida', 'comissao_liberada', 'saque_atualizado')),
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists partner_notifications_partner_idx on public.partner_notifications(partner_id, created_at desc);

alter table public.partner_notifications enable row level security;

create policy "partner_notifications_select_own_or_admin" on public.partner_notifications
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where profile_id = auth.uid())
  );

-- Sem policy de INSERT/UPDATE/DELETE — assim como as demais tabelas, toda
-- escrita passa pelas rotas de servidor com a service_role key. O parceiro
-- só pode marcar como lida via rota de servidor que confirma que a
-- notificação é dele antes de gravar.
