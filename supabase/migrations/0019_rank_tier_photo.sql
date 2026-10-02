-- Patas & Passos — Portal do Parceiro
-- Foto real por nível de Rank, além do emoji já existente. Bucket público
-- (não tem dado sensível, é só a arte de cada nível exibida no painel do
-- parceiro) -- upload sempre via rota de servidor com service_role key,
-- restrita a admin chefe (profiles.is_owner), então não precisa de policy
-- de INSERT/UPDATE em storage.objects.
-- Rode DEPOIS de 0001..0018.

alter table public.rank_tiers add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('rank-photos', 'rank-photos', true)
on conflict (id) do nothing;
