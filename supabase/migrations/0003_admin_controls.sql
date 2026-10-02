-- Patas & Passos — Portal do Parceiro
-- Controles administrativos: dados de teste, arquivamento, comprovante de
-- pagamento. Rode DEPOIS de 0001_init.sql e 0002_whatsapp_closing.sql.

-- ---------------------------------------------------------------------------
-- is_test: marca registros criados só pra validar o sistema, nunca vendas
-- reais. "Remover dados de teste" só apaga o que estiver marcado aqui.
-- ---------------------------------------------------------------------------
alter table public.partners add column if not exists is_test boolean not null default false;
alter table public.customers add column if not exists is_test boolean not null default false;

create index if not exists partners_is_test_idx on public.partners(is_test);
create index if not exists customers_is_test_idx on public.customers(is_test);

-- ---------------------------------------------------------------------------
-- archived_at: alternativa à exclusão definitiva — tira o registro da
-- operação ativa sem apagar o histórico.
-- ---------------------------------------------------------------------------
alter table public.customers add column if not exists archived_at timestamptz;

-- ---------------------------------------------------------------------------
-- payouts: dados do pagamento confirmado (forma, observação, comprovante).
-- proof_path aponta pra um objeto no bucket privado "comprovantes" — nunca
-- uma URL pública; o acesso é sempre via signed URL gerada no servidor,
-- checando antes que quem pede é o admin ou o próprio parceiro dono do saque.
-- ---------------------------------------------------------------------------
alter table public.payouts add column if not exists payment_method text;
alter table public.payouts add column if not exists notes text;
alter table public.payouts add column if not exists proof_path text;

-- ---------------------------------------------------------------------------
-- Bucket de comprovantes — privado. Sem policy de leitura pública nem por
-- role: todo acesso passa pela service_role key em rotas de servidor, que
-- decidem a autorização (admin vê tudo, parceiro só o próprio comprovante)
-- antes de gerar uma signed URL de vida curta.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('comprovantes', 'comprovantes', false)
on conflict (id) do nothing;
