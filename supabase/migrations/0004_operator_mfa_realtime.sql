-- Patas & Passos — Portal do Parceiro
-- Papel OPERADOR, contas ativas/inativas, notificações em tempo real.
-- Rode DEPOIS de 0001..0003.

-- ---------------------------------------------------------------------------
-- profiles.role passa a aceitar 'operator' — acesso operacional ao painel
-- admin, sem as ações críticas (zerar sistema, regras de comissão, criar
-- outros admins/operadores, marcar saque como pago).
-- ---------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'operator', 'partner'));

-- ---------------------------------------------------------------------------
-- profiles.active: permite desativar uma conta (admin ou operador) sem
-- excluir o histórico de quem fez o quê. Contas de parceiro continuam
-- usando partners.status (pending/active/blocked) pra isso.
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists active boolean not null default true;

-- ---------------------------------------------------------------------------
-- Realtime em partner_notifications: o sino do parceiro atualiza sozinho,
-- sem precisar de F5. RLS já existente continua valendo pra quem recebe
-- o quê — o Realtime nunca ignora a policy de SELECT da tabela.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'partner_notifications'
  ) then
    alter publication supabase_realtime add table public.partner_notifications;
  end if;
end $$;
