-- Patas & Passos — Portal do Parceiro
-- Atualiza o texto de benefício (vitrine) dos 5 níveis de Rank com a copy
-- definitiva enviada pela Patas & Passos. Só texto/vitrine -- min_clients e
-- percentuais continuam os mesmos já configurados (e continuam editáveis
-- em /admin/ranks a qualquer momento).
-- Rode DEPOIS de 0001..0015.

update public.rank_tiers set bonus_text =
  'Dê os primeiros passos! Divulgue seu cupom exclusivo. Ao alcançar 5 clientes, suas comissões são ativadas e o sistema ganha vida!'
  where key = 'filhote';

update public.rank_tiers set bonus_text =
  'Você desbloqueou 5% de comissão (pago todo dia 05) e 1% de recorrência mensal (pago todo dia 30) para cada cliente que continuar fiel!'
  where key = 'companheiro';

update public.rank_tiers set bonus_text =
  'Domine a matilha! Mantendo 10 clientes ativos, você garante seus 5% de comissão, ganha um Bônus Fixo em Dinheiro no mês e sua recorrência sobe para 2%! + Brinde de Agradecimento!'
  where key = 'lion_ouro';

update public.rank_tiers set bonus_text =
  'Status de Elite! Além dos 5% de comissão base e de um super Bônus Fixo mensal, você recebe Prêmios e Mimos Físicos exclusivos da Patas & Passos para você ou para o seu pet! + Garrafinha Personalizada com nossa Logo.'
  where key = 'tigre_platina';

update public.rank_tiers set bonus_text =
  'O Topo do Mundo! Torne-se a nossa maior lenda: garanta o Maior Bônus Fixo do sistema e o teto máximo de 5% de comissão recorrente todo dia 30! + Oportunidade de Trabalhar Conosco e Ser Chamado!! + Camisa da Patas & Passos.'
  where key = 'wolf_lenda';
