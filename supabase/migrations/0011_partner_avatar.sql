-- Patas & Passos — Portal do Parceiro
-- Avatar de personalização do parceiro (independente do Rank/gamificação).
-- Primeiro acesso = sorteio automático entre os 7 ícones oficiais
-- (public/avatars/*.png); escolha manual do parceiro tem prioridade sobre o
-- sorteio e persiste entre sessões/dispositivos.
-- Rode DEPOIS de 0001..0010.

alter table public.profiles add column if not exists avatar_key text
  check (avatar_key in ('pig', 'sheep', 'chicken', 'dog', 'horse', 'turtle', 'cat'))
  default (array['pig', 'sheep', 'chicken', 'dog', 'horse', 'turtle', 'cat'])[floor(random() * 7 + 1)::int];

alter table public.profiles alter column avatar_key set not null;

-- Backfill: quem já tinha conta antes desta migração nasce com sorteio
-- também, em vez de ficar sem avatar.
update public.profiles set avatar_key =
  (array['pig', 'sheep', 'chicken', 'dog', 'horse', 'turtle', 'cat'])[floor(random() * 7 + 1)::int]
  where avatar_key is null;
