---
description: Fase 3 (Build) — porta o front-end estático entregue para Next.js + TS + Tailwind e integra o mascote (prioridade do cliente).
argument-hint: "<nome-do-projeto>"
---

# Build do Site — **$ARGUMENTS**

Prioridade definida: **construir o site primeiro**. Esta é a Fase 3 do playbook.

## Passo 0 — Contexto
Leia `./docs/brand-guidelines.md`, `./docs/briefing-$ARGUMENTS.md` e, se existirem,
`./squad-output/$ARGUMENTS/03-copy.md` e `04-design.md`.
Fonte da verdade do front-end: `./_extracted/site-export/` (`index/creche/hotel/banho.html`, `site.css`, `mascot/`).

## Passo 1 — Execução (a5-engenharia-web)
Delegue ao **a5-engenharia-web**:
1. Scaffold Next.js 14 (App Router) + TS + Tailwind (ver `CLAUDE.md` → Quick Start) — sem sobrescrever os arquivos do squad.
2. Recriar os design tokens do `site.css` no Tailwind (cores, fontes Baloo 2 + Nunito, raios, sombras).
3. Portar as 4 páginas para rotas (`/`, `/creche`, `/hotel`, `/banho`) + seção Contato.
4. Integrar o mascote **MascotAuau** (camadas PNG, layout 360×380); copiar `mascot/` → `public/`.
5. CTAs de WhatsApp e selo "2 dias grátis"; deixar `⚠️ CONFIRMAR` onde faltam dados reais (telefone, fotos).
6. `npm run build` + `npm run lint` limpos. **Não** rodar build com `next dev` ativo.

## Passo 2 — Verificação
Use os tools `preview_*` para subir o dev server e confirmar no navegador (console sem erros,
páginas renderizando, mascote seguindo o cursor, responsivo). Evidência antes de declarar pronto.

## Passo 3 — Entrega
Apresente: o que foi implementado, link de preview, pendências `⚠️` do cliente e
o handoff para **a6-qa-acessibilidade** + **a7-seo-performance** (Fase 4).
Registre em `./squad-output/$ARGUMENTS/05-build.md`.
