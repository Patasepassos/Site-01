-- Patas & Passos — Portal do Parceiro
-- Schema inicial: perfis, parceiros, indicações, vendas, regras de comissão,
-- comissões, saques e auditoria. Rode este arquivo inteiro no SQL Editor do
-- Supabase (Project → SQL Editor → New query → colar → Run).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: 1 linha por usuário autenticado (auth.users). Guarda o papel
-- (admin | partner) usado por toda a autorização do sistema.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'partner' check (role in ('admin', 'partner')),
  full_name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- partners: dados específicos da parceria (documento, Pix, status, cupom).
-- ---------------------------------------------------------------------------
create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'blocked')),
  cpf_cnpj text not null,
  pix_key text not null,
  pix_key_type text not null check (pix_key_type in ('cpf', 'cnpj', 'email', 'telefone', 'aleatoria')),
  coupon_code text not null unique,
  terms_accepted_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists partners_status_idx on public.partners(status);

-- ---------------------------------------------------------------------------
-- customers: clientes indicados por um parceiro (referrals).
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  sequence_number bigint generated always as identity,
  service text not null check (service in ('passeios', 'socializacao', 'pet_sitter', 'creche', 'hotel', 'vacinas')),
  status text not null default 'indicado'
    check (status in ('indicado', 'em_contato', 'em_negociacao', 'fechado', 'cancelado', 'nao_convertido')),
  coupon_used text not null,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_partner_idx on public.customers(partner_id);
create index if not exists customers_status_idx on public.customers(status);

-- ---------------------------------------------------------------------------
-- commission_rules: regras configuráveis pelo admin — nada de % fixo no código.
-- service = null representa uma regra geral (vale para qualquer serviço).
-- ---------------------------------------------------------------------------
create table if not exists public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  service text check (service in ('passeios', 'socializacao', 'pet_sitter', 'creche', 'hotel', 'vacinas')),
  rule_type text not null check (rule_type in ('meta_clientes', 'recorrencia')),
  percentage numeric(5,2) not null check (percentage >= 0),
  min_clients int not null check (min_clients >= 1),
  recurring boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

-- ---------------------------------------------------------------------------
-- sales: registro interno da venda (valor NUNCA é exposto ao parceiro pela
-- API — nenhuma policy de SELECT libera esta tabela para role='partner').
-- ---------------------------------------------------------------------------
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  service text not null,
  contract_type text not null check (contract_type in ('avulso', 'mensal', 'anual')),
  amount numeric(10,2) not null check (amount >= 0),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists sales_customer_idx on public.sales(customer_id);

-- ---------------------------------------------------------------------------
-- commissions: valor JÁ CALCULADO pelo servidor por regra aplicada.
-- ---------------------------------------------------------------------------
create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  rule_id uuid not null references public.commission_rules(id),
  sale_id uuid references public.sales(id),
  period text not null, -- "2026-09"
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'bloqueada' check (status in ('bloqueada', 'liberada', 'paga')),
  unlocked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists commissions_partner_idx on public.commissions(partner_id);
create index if not exists commissions_status_idx on public.commissions(status);

-- ---------------------------------------------------------------------------
-- payouts: solicitações de saque.
-- ---------------------------------------------------------------------------
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  pix_key_snapshot text not null,
  status text not null default 'solicitado'
    check (status in ('solicitado', 'em_analise', 'aprovado', 'pago', 'recusado')),
  requested_at timestamptz not null default now(),
  processed_by uuid references public.profiles(id),
  processed_at timestamptz
);

create index if not exists payouts_partner_idx on public.payouts(partner_id);

-- ---------------------------------------------------------------------------
-- audit_logs: trilha de auditoria de toda ação sensível.
-- ---------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Regra geral: SELECT liberado ao dono dos dados (via partners.profile_id =
-- auth.uid()) e a admins. Toda ESCRITA de regra de negócio acontece via
-- rotas de servidor com a service_role key (que ignora RLS) — o RLS aqui é
-- uma segunda camada de proteção contra leitura indevida, não o único
-- mecanismo de autorização.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.partners enable row level security;
alter table public.customers enable row level security;
alter table public.commission_rules enable row level security;
alter table public.sales enable row level security;
alter table public.commissions enable row level security;
alter table public.payouts enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- partners
create policy "partners_select_own_or_admin" on public.partners
  for select using (profile_id = auth.uid() or public.is_admin());

-- customers
create policy "customers_select_own_or_admin" on public.customers
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where profile_id = auth.uid())
  );

-- commission_rules: qualquer usuário autenticado pode ler regras ativas
-- (é informação pública da parceria, não o faturamento da empresa).
create policy "commission_rules_select_authenticated" on public.commission_rules
  for select using (auth.role() = 'authenticated');

-- sales: NUNCA liberado para parceiro — só admin.
create policy "sales_select_admin_only" on public.sales
  for select using (public.is_admin());

-- commissions
create policy "commissions_select_own_or_admin" on public.commissions
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where profile_id = auth.uid())
  );

-- payouts
create policy "payouts_select_own_or_admin" on public.payouts
  for select using (
    public.is_admin()
    or partner_id in (select id from public.partners where profile_id = auth.uid())
  );

-- audit_logs: só admin.
create policy "audit_logs_select_admin_only" on public.audit_logs
  for select using (public.is_admin());

-- Nenhuma policy de INSERT/UPDATE/DELETE é criada para authenticated/anon:
-- por padrão, sem policy, a operação é negada. Todas as escritas passam
-- pelas rotas de servidor (service_role), que fazem a validação de negócio
-- antes de gravar.

-- ---------------------------------------------------------------------------
-- Seed: regras de comissão vigentes (editáveis depois pelo admin).
-- ---------------------------------------------------------------------------
insert into public.commission_rules (name, service, rule_type, percentage, min_clients, recurring, active)
values
  ('Regra dos 5 clientes', null, 'meta_clientes', 5.00, 5, false, true),
  ('1 cliente fiel recorrente', null, 'recorrencia', 1.00, 1, true, true)
on conflict do nothing;
