-- Patas & Passos — Portal do Parceiro
-- Tokens de push (Expo) do app mobile, pra Edge Function send-push-notification
-- disparar notificação quando uma linha é inserida em partner_notifications.
-- Rode DEPOIS de 0001..0016.

create table if not exists public.partner_push_tokens (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partners(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now()
);

create index if not exists partner_push_tokens_partner_id_idx
  on public.partner_push_tokens(partner_id);

alter table public.partner_push_tokens enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'partner_push_tokens'
      and policyname = 'partners manage own push tokens'
  ) then
    create policy "partners manage own push tokens"
      on public.partner_push_tokens
      for all
      using (
        partner_id in (
          select id from public.partners where profile_id = auth.uid()
        )
      )
      with check (
        partner_id in (
          select id from public.partners where profile_id = auth.uid()
        )
      );
  end if;
end
$$;
