# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏭 Dolvitta Squad OS (ler primeiro)

Este projeto é o **Projeto #1 da Fábrica de Sites Dolvitta** — uma agência em miniatura
conduzida por **12 agentes especializados** (A0–A11). Não trabalhe como um assistente
genérico: acione o agente certo para cada tarefa.

- **Playbook mestre:** [docs/dolvitta-playbook.md](docs/dolvitta-playbook.md) — fases, RACI, DoD, stack.
- **Contexto de marca (todos leem antes de agir):** [docs/brand-guidelines.md](docs/brand-guidelines.md)
- **Briefing deste projeto:** [docs/briefing-cantinho-do-auau.md](docs/briefing-cantinho-do-auau.md)
- **Agentes:** `.claude/agents/a0…a11-*.md` · **Comandos:** `/kickoff`, `/projeto`, `/build-site`
- **Outputs versionados:** `./squad-output/<projeto>/` (`01-pesquisa` … `11-financeiro`).

**Agentes:** A0 PMO · A1 Discovery · A2 Estratégia/Marca · A3 Conteúdo/Copy · A4 Design UI/UX ·
A5 Engenharia · A6 QA/Acessibilidade · A7 SEO/Performance · A8 Dados/Analytics · A9 Comercial ·
A10 Jurídico/LGPD · A11 Financeiro.

**Prioridade atual (Henry):** construir o site primeiro → comece por `/build-site cantinho-do-auau` (Fase 3).
**Regras de squad:** respeite a porta de saída de cada fase; nunca fabrique dados (`⚠️ NOT AVAILABLE` / `📊 ESTIMATIVA`); responda em português.

## Project Overview

**Cantinho do AuAu** — Site institucional de **cuidado pet** (NÃO é adoção) em São Caetano do
Sul/SP. Serviços: **Creche · Hotel · Banho & Tosa · Taxi Dog**. UI fofa guiada por um
mascote-cão interativo. Front-end já entregue como export estático em `_extracted/site-export/`
(HTML/CSS), a ser portado para Next.js.

**Stack**: Next.js 14+, TypeScript, Tailwind CSS, React
**Hosting**: Vercel (preferred based on deployment patterns)
**Fonte da verdade do front-end:** `_extracted/site-export/` (mascote `MascotAuau`, camadas PNG em `mascot/`).

## Quick Start

```powershell
# Bootstrap the project
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes

# Install dependencies
npm install

# Run dev server
npm run dev

# Build and check
npm run build
npm run lint
```

Access at `http://localhost:3000`. Live preview updates on file save.

## Project Structure

```
/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Homepage
│   ├── layout.tsx       # Root layout
│   └── [route]/
├── components/          # Reusable React components
│   ├── sections/        # Page sections (Hero, Features, etc.)
│   ├── ui/             # Generic UI atoms
│   └── ...
├── public/             # Static assets (mascote.png, SVG mascote.png)
├── styles/             # Global CSS (Tailwind config)
└── types/              # TypeScript interfaces
```

## Development Guidelines

### Token Efficiency (⚠️ Important)
- Follow `/context-compression` principles before starting work
- Read existing files before making changes (no blind writes)
- Batch independent edits to minimize tool calls
- When exploring: use `Glob` + `Grep` before `Agent`
- Use `Read` once per file max — subsequent edits use `Edit`

### Code Style
- Use TypeScript strictly (no `any`)
- Favor composition over inheritance
- Keep components focused and testable
- Use `@/*` imports consistently

### File Patterns
- **Components**: `PascalCase.tsx`
- **Utils**: `camelCase.ts`
- **Types**: `types.ts` or co-locate with component

### Common Commands
```powershell
# Single file type check
npx tsc --noEmit app/page.tsx

# Build for production
npm run build

# Check for linting issues
npm run lint

# Kill port 3000 if dev server won't start
npx kill-port 3000
```

## Mascot Pipeline (important — non-obvious)

The mascot in [MascotDog.tsx](components/mascot/MascotDog.tsx) is **not drawn in SVG** — it
is the real `mascote.png` art, sliced into transparent PNG layers so head/tail can move
independently while staying pixel-identical to the source illustration.

Layers live in `/public`: `dog-body.png` (body, top erased above the chest),
`dog-head.png` (ears+face, rotates toward cursor — the black collar on the body hides the
neck seam), `dog-tail.png` (taken from `SVG mascote.png` parts sheet, wags), `dog-full.png`
(reference/fallback).

Regenerate the layers with the Python scripts (Pillow + numpy + scipy):
```powershell
python scripts/isolate_dog.py   # mascote.png -> public/dog-full.png (chroma-key + keep largest CC + fill holes)
python scripts/slice_layers.py  # dog-full.png -> dog-head.png + dog-body.png
python scripts/extract_tail.py  # SVG mascote.png -> dog-tail.png
```
Key isolation rule: background = bluish **and bright** (`max(r,g,b) > 175`); the dark
slate inner-ear is bluish but dark, so the brightness gate keeps it. If you re-export the
source art, re-check `NAT_W/NAT_H` in MascotDog.tsx and the slice Y-cuts in `slice_layers.py`.

Animation states (Framer Motion `useSpring`/`useTransform`): head follow (±8°, spring),
breathing, floating, parallax tilt, ear lag, tail wag (speeds up on proximity/hover),
hover scale+glow, click → bark speech bubble. Head tracking listens to **window**
`mousemove`, not just hover, so the dog watches the cursor anywhere on screen.

### Traced vector layers (CURRENT hero mascot — faithful + vector + rigged)

The hero uses [MascotDog.tsx](components/mascot/MascotDog.tsx) pointed at **auto-traced
vector** layers in `/public/vec/` (`body.svg`, `head.svg`, `tail.svg`). These are the real
hero PNG slices run through **vtracer** — so they are *pixel-faithful to the approved art*
**and** resolution-independent. This is the key insight: don't hand-draw the dog (looks like
clip-art) and don't redraw in Illustrator (slow) — vectorize the real sliced art.

```powershell
# after isolate_dog.py + slice_layers.py + fix_tail.py produce the PNG layers:
python scripts/vectorize.py     # dog-{full,body,head,tail}.png -> public/vec/*.svg (vtracer)
python scripts/combine_svg.py   # public/vec/*.svg -> public/mascot/dog-traced.svg (named groups)
```
`pip install vtracer` if missing. Tune quality in `vectorize.py` `OPTS` (filter_speckle,
color_precision, mode='spline'). The rig (head ±8° follow, tail wag, breathing, parallax,
hover, click-bark) lives in MascotDog.tsx and works the same on `.svg` or `.png` srcs.

Master deliverable [public/mascot/dog-traced.svg](public/mascot/dog-traced.svg) = the three
traced layers as named `<g id="tail|body|head">` (viewBox `0 0 601 747`, pivot notes in
header) — import into **Rive / Figma / Illustrator** for a `.riv` state machine
(`DogController`: `MouseX/Y`, `Hover`, `Click`, `Bark`, `Curious`, `Excitement`).

Alternatives kept but NOT wired in: [MascotVector.tsx](components/mascot/MascotVector.tsx)
+ [dogArt.tsx](components/mascot/dogArt.tsx) (hand-drawn vector, looks like clip-art — avoid)
and the raw PNG-layer srcs (`/public/dog-*.png`).

⚠️ Don't run `npm run build` while `next dev` is live — both write `.next` and it blanks
the dev server (fix: kill port 3000, `rm -rf .next`, restart `npm run dev`).

## UI/UX Specifics

- **Mascot**: Use mascote.png or SVG mascote.png in hero/branding sections
- **Color & Layout**: Establish Tailwind config early; use consistent spacing/typography
- **Mobile-First**: Design assumes mobile first, then scale to desktop
- **Interactions**: Simple, no heavy animations unless explicitly requested

## Before Committing

1. Run `npm run build` — no TS errors
2. Run `npm run lint` — no ESLint failures
3. Verify dev server starts: `npm run dev`
4. Check homepage renders at `http://localhost:3000`

## Notes for Claude Instances

- This is a **new project** — expect to scaffold and establish patterns early
- User prefers **concise, token-aware responses** — use summaries, not verbose explanations
- **Context compression triggers at 70-80%** — save the session state and proceed
- Mascot assets are provided; reference them from `/public/`
