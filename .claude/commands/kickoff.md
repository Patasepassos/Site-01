---
description: Abre um novo projeto na Fábrica Dolvitta — preenche o briefing e monta o plano de fases (Fase 0).
argument-hint: "<nome-do-projeto>"
---

# Kickoff Dolvitta — **$ARGUMENTS**

## Passo 0 — Setup
```bash
mkdir -p ./squad-output/$ARGUMENTS
date +%Y-%m-%d
```

## Passo 1 — Briefing (Fase 0)
Leia `./docs/dolvitta-playbook.md` (Seção 9) e `./docs/brand-guidelines.md`.
Se já existir `./docs/briefing-$ARGUMENTS.md`, use-o. Caso contrário, conduza o briefing
fazendo **uma pergunta por vez** (identificação → objetivo → público → marca → estrutura →
referências → restrições → time). Aguarde as respostas. Marque `⚠️` o que o cliente deve confirmar.

## Passo 2 — Plano (A0)
Delegue ao **a0-direcao-projeto**: transformar o briefing em plano de fases, definir os
agentes ativos e a próxima ação. Salvar em `./squad-output/$ARGUMENTS/00-plano.md`.

## Passo 3 — Entrega
Apresente ao usuário:
1. Resumo do briefing (com pendências `⚠️`)
2. Plano de fases e agentes ativos
3. Próxima ação recomendada (`/build-site` ou `/projeto` conforme a prioridade)
