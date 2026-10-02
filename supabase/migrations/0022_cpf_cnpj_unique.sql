-- Patas & Passos — Portal do Parceiro
-- Achado na auditoria: cpf_cnpj não tinha nenhuma restrição de unicidade no
-- banco -- a checagem em /api/parceiros/cadastro evita duplicata no caminho
-- normal, mas sem isso aqui duas requisições simultâneas ainda podiam
-- escapar (race condition). Índice parcial porque contas excluídas têm
-- cpf_cnpj anonimizado pra '00000000000' (lib: app/api/parceiros/excluir) e
-- várias contas excluídas precisam poder compartilhar esse mesmo valor.
-- Rode DEPOIS de 0001..0021.

create unique index if not exists partners_cpf_cnpj_unique_idx
  on public.partners (cpf_cnpj)
  where cpf_cnpj <> '00000000000';
