-- Patas & Passos — Portal do Parceiro
-- Tabela genérica de configuração chave/valor, editável pelo admin -- usada
-- primeiro pra região de atendimento do programa de indicações, mas
-- reaproveitável pra outras configs futuras sem precisar de nova migração.
-- NÃO mexe em nenhuma estrutura existente (lib/site.ts continua descrevendo
-- São Caetano do Sul + Santo André como área geral do negócio; isto aqui é
-- só a regra do PROGRAMA DE PARCERIA, que pode divergir e evoluir separado).
-- Rode DEPOIS de 0001..0014.

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.app_settings (key, value) values
  ('partner_service_area_note',
   'Atualmente, o programa de indicações considera clientes de São Caetano do Sul — SP. Indicações de regiões não atendidas pela Patas & Passos não serão consideradas vendas válidas para comissão.')
on conflict (key) do nothing;
