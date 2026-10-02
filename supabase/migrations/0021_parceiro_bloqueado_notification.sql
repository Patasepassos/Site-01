-- Patas & Passos — Portal do Parceiro
-- partner_notifications ganha o tipo 'parceiro_bloqueado' — usado quando o
-- admin muda o status do parceiro para 'blocked' (reprovação de cadastro
-- pendente ou suspensão de conta ativa). Antes dessa migração, essa
-- transição não avisava o parceiro de jeito nenhum: ele só descobria
-- tentando logar e vendo a tela de acesso bloqueado.
-- Rode DEPOIS de 0001..0020.

alter table public.partner_notifications drop constraint if exists partner_notifications_type_check;
alter table public.partner_notifications add constraint partner_notifications_type_check
  check (type in (
    'indicacao_convertida',
    'comissao_liberada',
    'saque_atualizado',
    'elegibilidade_atualizada',
    'parceiro_aprovado',
    'parceiro_bloqueado',
    'indicacao_status_atualizado'
  ));
