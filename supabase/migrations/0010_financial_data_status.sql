-- Patas & Passos — Portal do Parceiro
-- Aprovação manual de dados financeiros/Pix com 3 estados em vez de um
-- booleano -- permite representar "em análise" e "correção necessária" como
-- estados distintos, e desacopla a aprovação financeira da aprovação geral
-- do parceiro (status active/blocked). Sem nenhuma API externa -- aprovação
-- 100% manual da Patas & Passos, preparado pra no futuro plugar uma API de
-- validação de titularidade Pix sem remodelar nada.
-- Rode DEPOIS de 0001..0009.

alter table public.partners add column if not exists financial_data_status text not null default 'pending'
  check (financial_data_status in ('pending', 'approved', 'rejected'));
alter table public.partners add column if not exists financial_data_reviewed_at timestamptz;
alter table public.partners add column if not exists financial_data_review_note text;

-- Backfill: quem já tinha financial_data_verified = true (aprovado antes
-- dessa migração) nasce 'approved' -- preserva o estado real de quem já
-- passou pela aprovação geral do parceiro.
update public.partners set financial_data_status = 'approved' where financial_data_verified = true;
