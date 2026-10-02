-- Patas & Passos — Portal do Parceiro
-- "Admin chefe": profiles.is_owner é um nível extra de permissão SOMADO a
-- role='admin' (não substitui o role) -- hoje só libera trocar a foto dos
-- níveis de Rank (migração 0019). Atribuível a qualquer admin depois via
-- /admin/usuarios, sem precisar editar código. Semeia pataspassos4@gmail.com
-- como o primeiro admin chefe, se já existir como admin.
-- Rode DEPOIS de 0001..0017.

alter table public.profiles add column if not exists is_owner boolean not null default false;

update public.profiles set is_owner = true
where role = 'admin'
  and id = (select id from auth.users where email = 'pataspassos4@gmail.com');
