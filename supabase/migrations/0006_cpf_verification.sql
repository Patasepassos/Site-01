-- Patas & Passos — Portal do Parceiro
-- Verificação real de CPF via API CPF Brasil (https://www.cpf-brasil.org).
-- Rode DEPOIS de 0001..0005.

-- ---------------------------------------------------------------------------
-- Não criamos uma coluna `cpf` separada: `cpf_cnpj` já existe e já guarda o
-- CPF (11 dígitos) ou CNPJ (14 dígitos) do parceiro. A verificação automática
-- só roda quando esse valor tem 11 dígitos (pessoa física) — a API CPF
-- Brasil não valida CNPJ, e não existe integração de CNPJ contratada.
-- ---------------------------------------------------------------------------
alter table public.partners add column if not exists birth_date date;
alter table public.partners add column if not exists cpf_status text not null default 'pending'
  check (cpf_status in ('pending', 'verified', 'failed'));
alter table public.partners add column if not exists cpf_verified_at timestamptz;
alter table public.partners add column if not exists cpf_verification_reason text;
alter table public.partners add column if not exists cpf_verification_hash text;

create index if not exists partners_cpf_status_idx on public.partners(cpf_status);
