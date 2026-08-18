# 🐾 Auau — mascote interativo (pacote de integração)

Componente React/TypeScript pronto para o site **Cantinho do AUAU** (Next.js App Router).
Renderiza o mascote montado a partir de PNGs recortados e o anima: a cabeça segue o
cursor, as pupilas acompanham, ele pisca, respira, abana o rabo, mexe a língua e fica
"feliz" no hover. **Sem dependências externas** — só React + CSS. ~60fps (só `transform`).

## Conteúdo do pacote

```
entrega-mascote/
├── MascotAuau.tsx        # o componente (client component)
├── MascotAuau.css        # estilos + animações (importado pelo .tsx)
├── mascot-layout.json    # posições da montagem (referência / opcional)
├── README.md             # este arquivo
└── assets/               # PNGs do mascote (ir para /public/mascot/)
    ├── tail_edit.png      02_head.png      eyes_base.png
    ├── body_edit.png      04_ears.png      eyes_pupils.png
    ├── mouth_edit.png     body_notail.png  06_tongue.png  07_tail.png
```

> `tail_edit.png`, `body_edit.png` e `mouth_edit.png` são recortes feitos à mão pelo Henry
> (rabo limpo; corpo sem o rabo embutido; focinho ajustado). As **orelhas já fazem parte de
> `02_head.png`** — por isso o layer separado `04_ears.png` fica **desligado** no layout.
> (`07_tail.png` é o rabo original, mantido só como referência.)

## Como integrar (Next.js)

1. **Assets** → copie tudo de `assets/` para **`public/mascot/`**
   (resultado: `public/mascot/07_tail.png`, etc.).
2. **Componente** → copie `MascotAuau.tsx` e `MascotAuau.css` para `components/` (ou onde preferir).
3. **Use** onde quiser (ex.: na Hero):

```tsx
import MascotAuau from '@/components/MascotAuau';

export default function Hero() {
  return (
    <section className="hero">
      <MascotAuau width="clamp(240px, 40vw, 380px)" />
    </section>
  );
}
```

Pronto. O componente já segue o cursor pela janela inteira.

### Props

| prop        | tipo     | padrão                              | descrição |
|-------------|----------|-------------------------------------|-----------|
| `width`     | string   | `clamp(220px, 60vw, 380px)`         | largura CSS do mascote (a altura segue a proporção 360×380) |
| `basePath`  | string   | `"/mascot/"`                        | pasta dos PNGs em `/public` |
| `layout`    | objeto   | `DEFAULT_LAYOUT` (dentro do .tsx)   | posições das peças (formato do editor) |
| `className` | string   | `""`                                | classe extra no wrapper |

## Layout (posições das peças)

As posições vivem em `DEFAULT_LAYOUT`, no topo de `MascotAuau.tsx` — **valores exatos da
montagem aprovada** (base `360×380`, origem no canto superior esquerdo, em px). É o mesmo
formato do botão **Copiar JSON** do editor, então dá para colar um novo layout direto ali
(ou passar via prop `layout`).

```jsonc
"pieces": {
  "tail":   { "x": 208, "y": 232, "w": 53,  "z": 1, "on": true  },
  "body":   { "x": 70,  "y": 175, "w": 175, "z": 2, "on": true  },  // body_edit.png
  "head":   { "x": 43,  "y": 49,  "w": 185, "z": 3, "on": true  },  // inclui as orelhas
  "ears":   { "x": 70,  "y": 8,   "w": 174, "z": 4, "on": false },  // off (já está na cabeça)
  "eyes":   { "x": 84,  "y": 92,  "w": 104, "z": 5, "on": true  },
  "mouth":  { "x": 98,  "y": 139, "w": 75,  "z": 6, "on": true  },  // mouth_edit.png
  "tongue": { "x": 123, "y": 171, "w": 26,  "z": 7, "on": true  }
}
```

Como funciona: as peças `head, eyes, mouth, tongue` formam o **grupo da cabeça** (giram
juntas, com z-index acima do corpo); `tail` e `body` ficam soltas. A cabeça gira em torno
da base do pescoço, calculada a partir da peça `head`.

## Comportamentos

- **Cabeça** segue o cursor (±8°, suavização com lerp; ouve a janela toda).
- **Pupilas** seguem o cursor (máx 6px, presas aos olhos).
- **Piscar** aleatório (3–7s, ~120ms).
- **Respiração** do corpo (escala 1→1.02, 4s).
- **Rabo** abana sempre; mais rápido perto do cursor / no hover.
- **Língua** com leve bounce; **flutuação** suave do conjunto.
- **Hover** → felicidade: olhos aumentam, rabo acelera.
- Respeita `prefers-reduced-motion`.

## Requisitos

- React 18+ / Next 13+ (App Router). O componente já declara `'use client'`.
- Sem bibliotecas externas. Tailwind **não** é necessário (mas convive numa boa).
- TypeScript: tipos inclusos. Em JS puro, é só renomear para `.jsx` e remover as anotações.
