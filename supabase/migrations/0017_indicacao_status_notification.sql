-- Patas & Passos — Portal do Parceiro
-- partner_notifications ganha o tipo 'indicacao_status_atualizado' — usado
-- quando o admin move uma indicação pelo dropdown "Mover para..." (em
-- contato / em negociação / cancelado / não convertido), pra avisar o
-- parceiro por e-mail mesmo nesses passos intermediários (antes só o
-- fechamento da venda notificava).
-- Rode DEPOIS de 0001..0016.

alter table public.partner_notifications drop constraint if exists partner_notifications_type_check;
alter table public.partner_notifications add constraint partner_notifications_type_check
  check (type in (
    'indicacao_convertida',
    'comissao_liberada',
    'saque_atualizado',
    'elegibilidade_atualizada',
    'parceiro_aprovado',
    'indicacao_status_atualizado'
  ));
