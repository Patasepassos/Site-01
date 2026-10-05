-- Patas & Passos — Portal do Parceiro
-- Recuperação de senha por código, substituindo o link mágico do Supabase
-- (resetPasswordForEmail + /auth/callback), que falhava com frequência --
-- seja por e-mail não chegar, ir pro spam, ou o link expirar antes do clique.
--
-- Novo fluxo, tudo na mesma tela, sem link nenhum pra clicar:
--   1) código de 6 dígitos por e-mail (Resend)
--   2) código por SMS (Twilio Verify -- mesmo canal já usado pra verificar
--      o WhatsApp do parceiro), que de quebra confirma que o número é real
--   3) nova senha direto, assim que as duas etapas passam
--
-- Como não existe sessão autenticada durante esse fluxo, um token opaco
-- (gerado em memória, nunca em texto puro no banco) amarra as 3 etapas pro
-- mesmo pedido de recuperação -- mesmo padrão de hash já usado pros códigos.

create table if not exists public.partner_password_resets (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  token_hash text not null,
  email_code_hash text not null,
  email_code_expires_at timestamptz not null,
  email_code_attempts int not null default 0,
  email_verified_at timestamptz,
  phone_e164 text,
  phone_verified_at timestamptz,
  -- true quando o SMS não pôde ser enviado (sem telefone válido, Twilio
  -- fora do ar, conta trial sem o número verificado etc.) -- nesse caso o
  -- parceiro segue só com a verificação de e-mail, pra nunca travar o
  -- acesso à própria conta por causa de um provedor terceiro.
  phone_skipped boolean not null default false,
  consumed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists partner_password_resets_token_idx on public.partner_password_resets(token_hash);
create index if not exists partner_password_resets_partner_idx on public.partner_password_resets(partner_id, created_at desc);

alter table public.partner_password_resets enable row level security;
-- Sem nenhuma policy: só o service role (supabaseAdmin) acessa essa tabela --
-- nunca é lida pelo parceiro nem pelo admin direto, puramente interna ao
-- fluxo de recuperação de senha.
