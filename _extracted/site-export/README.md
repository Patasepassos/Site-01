# 🐾 Cantinho do AuAu — Site (pacote para Claude Code)

Site institucional do **Cantinho do AuAu** (creche, hotel, banho & taxi dog em São Caetano do Sul/SP).
HTML + CSS estáticos, sem build. Abra `index.html` no navegador ou sirva a pasta.

## Estrutura

```
site-export/
├── index.html        # Home — hero com mascote interativo (cabeça segue o cursor, rabo abana, pisca)
├── creche.html       # Creche — benefícios, rotina do dia, depoimentos, CTA
├── hotel.html        # Hotel — como funciona, estrutura/acomodações, galeria, depoimentos, CTA
├── banho.html        # Banho & Tosa — serviços, Taxi Dog, depoimentos, CTA (com bolhas animadas)
├── site.css          # Estilos compartilhados: tokens, top bar, botões, cards, depoimentos, rodapé
└── mascot/           # Arte do mascote em camadas (PNG) + logo
    ├── dog-cutout.png      # doguinho recortado (usado na top bar, saltando do quadrado)
    ├── logo-face.png       # rostinho quadrado (favicon)
    ├── logo-full.png       # logo horizontal completo
    ├── 02_head.png, 04_ears.png, 06_tongue.png, mouth_edit.png,
    ├── eyes_base.png, eyes_pupils.png,
    ├── body_edit.png, body_notail.png, tail_edit.png   # peças do rig interativo
```

## Paleta & tipografia (tokens em `site.css`)

```
--blue:#2F74E6  --blue-deep:#1E55B8  --blue-soft:#AFCDF6  --coral:#FF8A5B
--ink:#1F2E4D   --ink-soft:#5C6B89
Títulos: "Baloo 2"  ·  Texto: "Nunito"  (Google Fonts)
```

## Mascote interativo (na home)

O mascote é montado em camadas via JS (no final de `index.html`), a partir de um layout
em px (base 360×380). Comportamentos: a **cabeça inteira** segue o cursor (±8°), as **pupilas**
acompanham, **pisca** aleatório, **respiração** do corpo, **orelhas/língua** com idle e o
**rabo abana** (acelera quando o mouse chega perto). Respeita `prefers-reduced-motion`.

> Versão React/Next.js do mascote: o componente original `MascotAuau.tsx` (Framer Motion) e o
> `mascot-layout.json` seguem o mesmo layout/peças desta pasta. Para usar no Next.js, copie
> `mascot/` para `public/` e aponte os `src` para `/mascot/...`.

## Pendências para finalizar (conteúdo do cliente)

- **WhatsApp / telefone / endereço**: os botões usam `https://wa.me/` genérico. Troque pelo número
  real (ex.: `https://wa.me/5511999999999`).
- **Fotos reais**: os blocos com `.ph` (placeholders azuis com patinha) marcam onde entram fotos.
  Substitua por `<img>` mantendo o `border-radius`/proporção.
- **Textos**: copy fofa baseada no site atual — ajuste livremente.

## Rodar localmente

Abra `index.html` no navegador, ou sirva a pasta:

```bash
npx serve site-export      # ou: python3 -m http.server
```
