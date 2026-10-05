-- Patas & Passos — Portal do Parceiro
-- Novo status intermediário 'servico_contratado': marca que o cliente
-- contratou o serviço ANTES do fechamento formal da venda (que continua
-- exigindo valor/forma de pagamento via "Fechar venda" e só esse
-- fechamento conta pra meta de clientes/comissão -- este status aqui é só
-- informativo/motivacional pro parceiro acompanhar o progresso).
-- Rode DEPOIS de 0001..0019.

alter table public.customers drop constraint if exists customers_status_check;
alter table public.customers add constraint customers_status_check
  check (status in (
    'indicado',
    'em_contato',
    'em_negociacao',
    'servico_contratado',
    'fechado',
    'cancelado',
    'nao_convertido'
  ));
