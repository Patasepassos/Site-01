-- Patas & Passos — Portal do Parceiro
-- Verificação real de e-mail via Resend (código de 6 dígitos, curto prazo,
-- uso único). Até aqui `emailVerified` só lia auth.users.email_confirmed_at,
-- que é SEMPRE true — o cadastro cria a conta com email_confirm: true de
-- propósito (senão o Supabase bloquearia o primeiro login de todo mundo).
-- Ninguém nunca provou que o e-mail é seu de verdade. Rode DEPOIS de 0001..0006.

alter table public.partners add column if not exists email_verified boolean not null default false;
alter table public.partners add column if not exists email_verified_at timestamptz;

-- Parceiros já ativos: mesmo critério de "quem já foi revisado continua
-- valendo" usado na migração 0005 pros outros campos — evita que ligar essa
-- exigência agora torne todo mundo já aprovado inelegível de repente.
-- Cadastro novo e troca de e-mail passam pelo fluxo real daqui pra frente.
update public.partners set email_verified = true, email_verified_at = now() where status = 'active';

-- ---------------------------------------------------------------------------
-- partner_email_otps: código de verificação. Guarda só o hash (nunca o
-- código em texto puro), com expiração curta, contagem de tentativas e
-- marcação de uso — tudo pensado pra nunca ser lido fora do service role.
-- ---------------------------------------------------------------------------
create table if not exists public.partner_email_otps (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists partner_email_otps_partner_idx on public.partner_email_otps(partner_id, created_at desc);

alter table public.partner_email_otps enable row level security;
-- Sem nenhuma policy: só o service role (supabaseAdmin) acessa essa tabela.
-- Nunca é lida direto pelo parceiro nem pelo admin — é puramente interna.
