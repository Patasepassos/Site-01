---
description: Orquestra o fluxo completo de fases do squad Dolvitta (Discovery → Estratégia → Conteúdo+Design → Build → QA+SEO+Launch → Growth).
argument-hint: "<nome-do-projeto>"
---

# Fluxo Completo Dolvitta — **$ARGUMENTS**

Orquestre as fases respeitando as **portas de saída** do `./docs/dolvitta-playbook.md`.
Antes de cada fase, confirme com o usuário se a anterior foi aprovada.
Outputs em `./squad-output/$ARGUMENTS/`.

## Passo 0 — Pré-requisitos
- Existe `./squad-output/$ARGUMENTS/00-plano.md`? Se não, rode `/kickoff $ARGUMENTS` primeiro.
- Todos os agentes leem `./docs/brand-guidelines.md` antes de agir.

## Passo 1 — Execução por fases (handoff explícito)
**Fase 1 · Discovery & Estratégia**
→ **a1-discovery-pesquisa** → `01-pesquisa.md`
→ depois **a2-estrategia-marca** → `02-estrategia.md`
🚪 Porta: posicionamento + arquitetura de informação aprovados pelo usuário.

**Fase 2 · Conteúdo & Design (em PARALELO)**
→ **a3-conteudo-copy** → `03-copy.md` ⟂ **a4-design-ui-ux** → `04-design.md`
🚪 Porta: layout + copy aprovados (1 rodada de revisão).

**Fase 3 · Build**
→ **a5-engenharia-web** → código + `05-build.md` (preview)
🚪 Porta: todas as páginas revisáveis em preview.

**Fase 4 · QA, SEO & Lançamento (em PARALELO após build)**
→ **a6-qa-acessibilidade** → `06-qa.md` ⟂ **a7-seo-performance** → `07-seo.md` ⟂ **a8-dados-analytics** → `08-dados.md`
→ corrigir bloqueantes com **a5** → publicar.
🚪 Porta: site no ar, sem bloqueantes, com medição ligada (DoD).

**Fase 5 · Growth & Manutenção**
→ **a7** + **a8** → relatório/dashboard; **a0** atualiza backlog; **a9** reporta ao cliente.

## Passo 2 — Suporte comercial/legal/financeiro (paralelo, sob demanda)
- **a9-comercial-cliente** → proposta/aprovações · **a11-financeiro** → custo/preço · **a10-juridico-compliance** → contrato/LGPD/textos legais.

## Passo 3 — Entrega
A cada porta de fase, o **a0-direcao-projeto** consolida status (verde/amarelo/vermelho) e a próxima ação.
