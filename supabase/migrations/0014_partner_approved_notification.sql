-- Patas & Passos — Portal do Parceiro
-- partner_notifications ganha o tipo 'parceiro_aprovado' — usado quando o
-- admin aprova a solicitação de parceria (pending -> active), pra mostrar
-- "🎉 Você foi aprovado!" no painel.
-- Rode DEPOIS de 0001..0013.

alter table public.partner_notifications drop constraint if exists partner_notifications_type_check;
alter table public.partner_notifications add constraint partner_notifications_type_check
  check (type in ('indicacao_convertida', 'comissao_liberada', 'saque_atualizado', 'elegibilidade_atualizada', 'parceiro_aprovado'));
