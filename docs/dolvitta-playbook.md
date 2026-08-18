# Playbook de Kickoff — Fábrica de Sites Dolvitta

> **O que é este documento.** Ponto de partida (kickoff) de **todo novo projeto de site** na Dolvitta. Descreve a "empresa de tecnologia em miniatura" que monta cada projeto: fases, equipe de agentes, o que cada um faz, as *skills* reais que cada um usa dentro do Claude e os entregáveis esperados.
>
> **Como usar.** No início de cada projeto, copie este documento para a pasta do projeto, preencha o **Briefing de Kickoff** (Seção 9) e siga o **Fluxo de Fases** (Seção 3). Cada fase aponta quais agentes ativar e quais skills acionar.
>
> **Escopo.** Otimizado para **landing pages** (`LP`) e **sites institucionais** (`INST`).

---

## Índice
1. [Filosofia operacional](#1-filosofia-operacional)
2. [Organograma de agentes](#2-organograma-de-agentes)
3. [Fluxo de fases do projeto](#3-fluxo-de-fases-do-projeto)
4. [Detalhamento dos agentes](#4-detalhamento-dos-agentes)
5. [Matriz RACI por fase](#5-matriz-raci-por-fase)
6. [Stack tecnológico e conectores (MCPs)](#6-stack-tecnologico-e-conectores-mcps)
7. [Definição de Pronto (Definition of Done)](#7-definicao-de-pronto)
8. [Catálogo de skills por área](#8-catalogo-de-skills-por-area)
9. [Briefing de Kickoff (preencher por projeto)](#9-briefing-de-kickoff)
10. [Glossário](#10-glossario)

---

## 1. Filosofia operacional

A Dolvitta opera como uma **agência digital orientada a agentes**. Em vez de um assistente genérico fazendo tudo, cada projeto é conduzido por **agentes especializados** — como uma empresa de tecnologia tem áreas (Produto, Design, Engenharia, Growth, Dados, Operações). Cada agente tem **missão clara**, usa **skills específicas**, produz **entregáveis padronizados** e conhece seus **limites** (sabe quando fazer handoff).

Três princípios:

- **Especialização sobre generalismo.** Um agente focado produz resultado melhor e auditável.
- **Fases com handoff explícito.** O projeto avança por etapas com "porta de saída". Evita o erro mais caro: descobrir no desenvolvimento que o briefing estava errado.
- **Skills reais, não promessas.** Cada agente aponta para skills e conectores já instalados no ambiente Claude.

---

## 2. Organograma de agentes

```
                        ┌─────────────────────────────┐
                        │   A0 · Direção de Projeto    │
                        │   (Product Owner / PMO)      │
                        └──────────────┬──────────────┘
                                       │
        ┌──────────────────┬──────────┼───────────────┬──────────────────┐
  ESTRATÉGIA          CRIAÇÃO     ENGENHARIA       GROWTH            SUPORTE
        │                  │          │               │                  │
  A1 Discovery        A3 Conteúdo  A5 Eng. Web    A7 SEO &          A9 Comercial
  A2 Estratégia       A4 Design    A6 QA &        A8 Dados &        A10 Jurídico
     /Marca              UI/UX      Acessib.       Analytics         A11 Financeiro
```

| # | Agente | Frente | Missão em uma frase |
|---|--------|--------|---------------------|
| **A0** | Direção de Projeto (PMO) | Coordenação | Transforma o pedido do cliente em plano, distribui o trabalho e garante o cronograma. |
| **A1** | Discovery & Pesquisa | Estratégia | Entende cliente, público e concorrência antes de qualquer pixel. |
| **A2** | Estratégia & Marca | Estratégia | Define posicionamento, mensagem central e diretrizes de marca. |
| **A3** | Conteúdo & Copy | Criação | Escreve todo o texto do site com voz consistente e foco em conversão. |
| **A4** | Design UI/UX | Criação | Cria interface, design system e layouts de cada página. |
| **A5** | Engenharia Web | Engenharia | Constrói o site: front-end, back-end, integrações e deploy. |
| **A6** | QA & Acessibilidade | Engenharia | Garante que tudo funciona, é rápido e acessível antes de ir ao ar. |
| **A7** | SEO & Performance | Growth | Faz o site ser encontrado no Google e carregar rápido. |
| **A8** | Dados & Analytics | Growth | Instrumenta medição, monta dashboards e lê resultados. |
| **A9** | Comercial & Cliente | Suporte | Cuida da relação com o cliente: proposta, follow-up, aprovações. |
| **A10** | Jurídico & Compliance | Suporte | Contratos, LGPD, termos de uso e política de privacidade. |
| **A11** | Financeiro | Suporte | Orçamento do projeto, faturamento e controle de custos. |

> **Time mínimo viável.** Nem todo projeto usa os 12. Uma `LP` simples roda com **A0, A1, A3, A4, A5, A7**. Um `INST` completo usa A0–A8, acionando A9–A11 conforme contrato e medição.

---

## 3. Fluxo de fases do projeto

### Fase 0 — Kickoff & Briefing
**Agentes:** A0, A9 · **Objetivo:** capturar o pedido e abrir o projeto.
**Entregáveis:** Briefing preenchido; cronograma macro; projeto no gestor de tarefas.
**Porta de saída:** escopo, prazo e objetivo aprovados por escrito.

### Fase 1 — Discovery & Estratégia
**Agentes:** A1, A2, A0 · **Objetivo:** entender o terreno e decidir o posicionamento.
**Entregáveis:** pesquisa de público/concorrência; análise da empresa; posicionamento; arquitetura de informação.
**Porta de saída:** posicionamento e estrutura de páginas aprovados.

### Fase 2 — Conteúdo & Design
**Agentes:** A3, A4, A2 · **Objetivo:** criar texto e interface em paralelo.
**Entregáveis:** copy final por seção; design system; layout de todas as páginas; handoff para engenharia.
**Porta de saída:** layout + copy aprovados (1 rodada de revisão prevista).

### Fase 3 — Build (Desenvolvimento)
**Agentes:** A5, A4 (suporte), A3 (suporte) · **Objetivo:** transformar design em site funcional.
**Entregáveis:** site implementado; formulários/integrações; ambiente de preview.
**Porta de saída:** todas as páginas revisáveis em link de preview.

### Fase 4 — QA, SEO & Lançamento
**Agentes:** A6, A7, A8, A5 · **Objetivo:** validar qualidade e ir ao ar com medição.
**Entregáveis:** QA aprovado; SEO técnico/on-page; analytics; checklist de deploy; site em produção.
**Porta de saída:** site no ar, sem erros bloqueantes, com medição funcionando.

### Fase 5 — Growth & Manutenção
**Agentes:** A7, A8, A0, A9 · **Objetivo:** acompanhar resultados e evoluir.
**Entregáveis:** dashboard; relatório mensal; backlog de melhorias.
**Porta de saída:** ciclo recorrente estabelecido (ou projeto encerrado).

```
Fase 0       Fase 1          Fase 2         Fase 3      Fase 4            Fase 5
Kickoff  →  Discovery &  →  Conteúdo &  →  Build   →  QA, SEO &    →   Growth &
& Briefing   Estratégia      Design                    Lançamento       Manutenção
[A0,A9]      [A1,A2,A0]      [A3,A4,A2]    [A5,A4,A3] [A6,A7,A8,A5]    [A7,A8,A0,A9]
```

---

## 4. Detalhamento dos agentes

Cada ficha: **Missão · Responsabilidades · Skills & conectores · Entregáveis · Recebe de / Entrega para**. O detalhamento operacional completo de cada agente vive em `.claude/agents/aN-*.md`.

### A0 · Direção de Projeto (PMO)
Traduz o pedido em plano executável, distribui trabalho, mantém prazo/escopo/qualidade.
Skills: `product-management:write-spec`, `sprint-planning`, `roadmap-update`, `stakeholder-update`; `operations:capacity-plan`, `status-report`; `productivity:task-management`. MCP: ClickUp/Linear/Notion, Google Calendar.
Recebe de: cliente (via A9). Entrega para: todos.

### A1 · Discovery & Pesquisa
Reduz incerteza antes da criação: empresa, público, concorrência.
Skills: `sales:account-research`, `sales:competitive-intelligence`, `design:user-research`, `design:research-synthesis`, `product-management:synthesize-research`, `marketing:competitive-brief`.
Recebe de: A0. Entrega para: A2, A3, A4.

### A2 · Estratégia & Marca
Define posicionamento, mensagem central, diretrizes de marca e arquitetura de informação.
Skills: `marketing:competitive-brief`, `marketing:brand-review`, `anthropic-skills:brand-guidelines`, `product-management:product-brainstorming`. MCP: Canva.
Recebe de: A1. Entrega para: A3, A4.

### A3 · Conteúdo & Copy
Escreve cada palavra do site com voz consistente e foco em conversão.
Skills: `marketing:content-creation`/`draft-content`, `design:ux-copy`, `marketing:brand-review`, `marketing:email-sequence` (`LP`), `anthropic-skills:brand-guidelines`, `copywriting`.
Recebe de: A2. Entrega para: A4, A5.

### A4 · Design UI/UX
Design system, layouts (desktop/mobile), handoff técnico.
Skills: `design:design-system`, `design-critique`, `design-handoff`, `accessibility-review`, `anthropic-skills:canvas-design`, `algorithmic-art`, `frontend-design`. MCP: Canva, Figma, Higgsfield.
Recebe de: A2, A3. Entrega para: A5, A6.

### A5 · Engenharia Web
Transforma design+conteúdo em site real, rápido e sustentável.
Skills: `engineering:system-design`, `architecture`, `code-review`, `tech-debt`, `documentation`, `deploy-checklist`, `frontend-design`. MCP: Vercel, Supabase, GitHub.
Recebe de: A4, A3. Entrega para: A6, A7, A8.

### A6 · QA & Acessibilidade
Última linha de defesa: funciona, é rápido e acessível.
Skills: `engineering:testing-strategy`, `code-review`, `debug`, `design:accessibility-review`, `data:validate-data`, `verify`.
Recebe de: A5, A4. Entrega para: A5 (correções), A0 (go/no-go).

### A7 · SEO & Performance
Ser encontrado no Google e carregar rápido.
Skills: `marketing:seo-audit`, `campaign-plan` (`LP`), `performance-report`. MCP: Ahrefs, Supermetrics, Klaviyo.
Recebe de: A5. Entrega para: A8, A0.

### A8 · Dados & Analytics
Instala medição e transforma números em decisão.
Skills: `data:analyze`, `build-dashboard`, `create-viz`, `data-visualization`, `explore-data`, `statistical-analysis`, `validate-data`. MCP: Supabase/BigQuery, Amplitude/Pendo.
Recebe de: A5, A7. Entrega para: A0, A9.

### A9 · Comercial & Cliente
Relação com o cliente: proposta, comunicação, aprovações, follow-up.
Skills: `sales:create-an-asset`, `call-prep`, `call-summary`, `draft-outreach`, `daily-briefing`. MCP: Gmail, Calendar, HubSpot/Apollo/Close.
Recebe de: cliente. Entrega para: A0.

### A10 · Jurídico & Compliance
Contratos, LGPD e textos legais do site.
Skills: `legal:review-contract`, `triage-nda`, `compliance-check`, `signature-request`, `operations:compliance-tracking`. MCP: DocuSign, Box/Egnyte.
Recebe de: A9, A0. Entrega para: A5 (textos legais), A0.

### A11 · Financeiro
Orçamento, faturamento, custos, margem.
Skills: `finance:financial-statements`, `variance-analysis`, `journal-entry`, `anthropic-skills:xlsx`. MCP: BigQuery/Snowflake.
Recebe de: A0, A9. Entrega para: A0.

---

## 5. Matriz RACI por fase

**R** = Responsável · **A** = Aprovador · **C** = Consultado · **I** = Informado

| Agente | F0 | F1 | F2 | F3 | F4 | F5 |
|--------|:--:|:--:|:--:|:--:|:--:|:--:|
| A0 PMO | **A/R** | A | A | A | A | **A/R** |
| A1 Discovery | C | **R** | C | I | — | I |
| A2 Estratégia | C | **R** | C | I | I | C |
| A3 Conteúdo | I | C | **R** | C | C | C |
| A4 Design | I | C | **R** | C | C | I |
| A5 Engenharia | I | I | C | **R** | R | C |
| A6 QA | — | — | I | C | **R** | I |
| A7 SEO | I | C | C | C | **R** | **R** |
| A8 Dados | — | I | I | C | R | **R** |
| A9 Comercial | **R** | I | C | I | I | C |
| A10 Jurídico | C | — | C | C | C | — |
| A11 Financeiro | C | — | I | — | I | C |

---

## 6. Stack tecnológico e conectores (MCPs)

| Camada | Ferramenta padrão | Conector / Skill | Usado por |
|--------|-------------------|------------------|-----------|
| Gestão de projeto | ClickUp / Linear / Notion | MCP ClickUp/Linear/Notion | A0 |
| Versionamento | GitHub | MCP GitHub | A5, A6 |
| Hospedagem & deploy | Vercel | MCP Vercel | A5 |
| Banco & back-end | Supabase | MCP Supabase | A5, A8 |
| Design | Canva / Figma | MCP Canva, Figma | A4 |
| Mídia gerada (IA) | Higgsfield | MCP Higgsfield | A4 |
| SEO | Ahrefs | MCP Ahrefs | A7 |
| Analytics | Amplitude / Pendo / Supabase | MCP Amplitude/Pendo | A8 |
| Métricas de mkt | Supermetrics / Klaviyo | MCP Supermetrics/Klaviyo | A7, A8 |
| E-mail & agenda | Gmail / Google Calendar | MCP Gmail/Calendar | A9, A0 |
| CRM | HubSpot / Apollo / Close | MCP HubSpot/Apollo/Close | A9 |
| Assinatura & docs | DocuSign / Box / Egnyte | MCP DocuSign/Box/Egnyte | A10 |
| Documentos finais | Word/Excel/PDF/PPT | skills `docx`, `xlsx`, `pdf`, `pptx` | todos |

> Antes do primeiro uso de um conector no projeto, o agente responsável deve autenticá-lo (`authenticate` / `complete_authentication`).

---

## 7. Definição de Pronto (Definition of Done)

Site "pronto para o ar" só quando **todos** os itens estiverem satisfeitos.

**Conteúdo & Design** — copy final aprovado · layout responsivo sem quebras · imagens otimizadas com `alt`.
**Engenharia** — formulários enviando/armazenando · integrações testadas em produção · sem erros no console, sem 404 · checklist de deploy concluído.
**SEO & Performance** — títulos/metas/dados estruturados em todas as páginas · sitemap e robots.txt · Core Web Vitals em verde (ou plano registrado).
**Qualidade & Acessibilidade** — QA aprovado, sem bugs bloqueantes · WCAG 2.1 AA (contraste, teclado, leitores).
**Medição** — analytics instalado e eventos de conversão disparando · dashboard criado.
**Legal** — política de privacidade e termos publicados · aviso de cookies / consentimento LGPD ativo.
**Entrega** — domínio final + SSL · acessos e documentação entregues · aprovação formal de lançamento registrada (A9/A0).

---

## 8. Catálogo de skills por área

**Produto & Coordenação:** `write-spec`, `sprint-planning`, `roadmap-update`, `stakeholder-update`, `product-brainstorming`, `metrics-review`, `synthesize-research`, `competitive-brief` · `productivity: start / task-management / update`
**Operações:** `capacity-plan`, `status-report`, `process-doc`, `process-optimization`, `risk-assessment`, `runbook`, `change-request`, `compliance-tracking`, `vendor-review`
**Pesquisa & Estratégia:** `sales: account-research / competitive-intelligence` · `design: user-research / research-synthesis` · `marketing: competitive-brief`
**Conteúdo & Marketing:** `marketing: content-creation / draft-content / brand-review / seo-audit / campaign-plan / email-sequence / performance-report` · `design: ux-copy` · `anthropic-skills: brand-guidelines / internal-comms`
**Design:** `design: design-system / design-critique / design-handoff / accessibility-review` · `anthropic-skills: canvas-design / algorithmic-art`
**Engenharia:** `engineering: system-design / architecture / code-review / debug / tech-debt / testing-strategy / documentation / deploy-checklist / incident-response`
**Dados:** `data: analyze / build-dashboard / create-viz / data-visualization / explore-data / statistical-analysis / sql-queries / write-query / validate-data`
**Comercial:** `sales: create-an-asset / call-prep / call-summary / draft-outreach / daily-briefing / forecast / pipeline-review`
**Jurídico:** `legal: review-contract / triage-nda / compliance-check / signature-request / meeting-briefing / vendor-check`
**Financeiro:** `finance: financial-statements / variance-analysis / journal-entry / reconciliation`
**Documentos:** `anthropic-skills: docx / xlsx / pdf / pptx` · `schedule`

---

## 9. Briefing de Kickoff (preencher por projeto)

> Copie para um arquivo novo na pasta do projeto e preencha na Fase 0. Alimenta todos os agentes.

**Identificação** — Nome do projeto · Cliente/empresa · Tipo (☐ LP ☐ INST ☐ Outro) · Responsável Dolvitta · Kickoff/prazo.
**Objetivo** — Objetivo principal · Como medir sucesso · O que existe hoje (☐ Não tem ☐ Renovação: URL).
**Público** — Público-alvo · Ação desejada no site.
**Conteúdo & Marca** — Identidade visual? (☐ Sim ☐ Não) · Tom de voz · Quem produz textos/imagens.
**Estrutura** — Páginas/seções · Funcionalidades especiais · Integrações.
**Referências** — Sites que gosta · O que evitar.
**Restrições** — Orçamento/faixa · Domínio/hospedagem · Prazos fixos.
**Time do projeto** — marque os agentes ativos (A0–A11).

---

## 10. Glossário

- **Agente.** Papel especializado conduzido pelo Claude, com missão, responsabilidades e skills próprias.
- **Skill.** Capacidade instalada no Claude que dá ao agente instruções e ferramentas.
- **MCP / Conector.** Integração com ferramenta externa (Vercel, Supabase, Canva, Gmail…).
- **Handoff.** Passagem de bastão entre agentes/fases, com entregável definido.
- **Porta de saída.** Critério que precisa estar satisfeito para a fase avançar.
- **RACI.** Responsável, Aprovador, Consultado, Informado.
- **DoD.** Lista de critérios que define quando algo está realmente pronto.
- **WCAG.** Padrão internacional de acessibilidade web.
- **Core Web Vitals.** Métricas do Google de carregamento e estabilidade.
- **LGPD.** Lei Geral de Proteção de Dados.

---

*Documento vivo. Atualize a cada projeto que revelar um padrão novo.*
