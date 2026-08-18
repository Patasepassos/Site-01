'use client';

/**
 * MascotAuau — mascote interativo do Cantinho do AUAU.
 *
 * Rig: cabeça segue o cursor (±8°), pupilas seguem (máx 6px), piscar aleatório,
 * respiração, abano de rabo, orelhas idle, língua, e felicidade no hover.
 * Só `transform` é animado -> 60fps. Sem dependências externas.
 *
 * As peças são PNGs recortados (pasta /public/mascot/). A POSIÇÃO de cada peça
 * vem de `DEFAULT_LAYOUT` (base 360x380, origem no canto superior esquerdo) —
 * exatamente o formato do botão "Copiar JSON" do editor. Para bater 100% com a
 * arte aprovada, cole o JSON do editor em DEFAULT_LAYOUT (ou passe via prop `layout`).
 */
import { useEffect, useRef, useState } from 'react';
import './MascotAuau.css';

type Piece = { x: number; y: number; w: number; z: number; on: boolean };
type Layout = { canvas: { w: number; h: number }; active?: string[]; pieces: Record<string, Piece> };

/* ⚠️ Layout aprovado pelo Henry (melhor leitura/estimativa).
   Substitua pelo conteúdo do "Copiar JSON" do editor para ficar pixel-exato. */
const DEFAULT_LAYOUT: Layout = {
  canvas: { w: 360, h: 380 },
  active: ['tail', 'body', 'head', 'eyes', 'mouth', 'tongue'],
  pieces: {
    // valores EXATOS da montagem final do Henry (editor). As orelhas (layer 04)
    // ficam OFF de propósito — elas já fazem parte do PNG da cabeça (02_head.png).
    tail:        { x: 208, y: 232, w: 53,  z: 1, on: true },
    body:        { x: 70,  y: 175, w: 175, z: 2, on: true },
    body_notail: { x: 94,  y: 150, w: 175, z: 2, on: false },
    head:        { x: 43,  y: 49,  w: 185, z: 3, on: true },
    ears:        { x: 70,  y: 8,   w: 174, z: 4, on: false },
    eyes:        { x: 87,  y: 94,  w: 96,  z: 5, on: true },
    mouth:       { x: 98,  y: 139, w: 75,  z: 6, on: true },
    tongue:      { x: 123, y: 171, w: 26,  z: 7, on: true },
  },
};

/* peça -> arquivo(s) em /public/mascot/.  eyes = [base, pupilas] */
const FILES: Record<string, string | [string, string]> = {
  tail: 'tail_edit.png',           // rabo recortado à mão
  body: 'body_edit.png',           // corpo recortado à mão (sem o rabo embutido)
  body_notail: 'body_notail.png',
  head: '02_head.png',
  ears: '04_ears.png',
  eyes: ['eyes_base.png', 'eyes_pupils.png'],
  mouth: 'mouth_edit.png',         // focinho recortado à mão
  tongue: '06_tongue.png',
};
/* tamanho nativo (px) de cada PNG — usado só para o aspect-ratio dos olhos */
const NAT: Record<string, [number, number]> = {
  tail: [76, 104], body: [175, 150], body_notail: [175, 150], head: [185, 149],
  ears: [174, 100], eyes: [123, 54], mouth: [130, 84], tongue: [60, 47],
};
const HEAD_GROUP = ['ears', 'head', 'eyes', 'mouth', 'tongue']; // giram com a cabeça
const ANIM: Record<string, string> = {
  tail: 'm-tail', body: 'm-body', body_notail: 'm-body', ears: 'm-ears', tongue: 'm-tongue',
};

export interface MascotAuauProps {
  /** Layout no formato do editor (Copiar JSON). Padrão: DEFAULT_LAYOUT. */
  layout?: Layout;
  /** Caminho base dos PNGs em /public. Padrão: "/mascot/". */
  basePath?: string;
  /** Largura CSS do mascote (ex.: "320px", "clamp(220px,60vw,380px)"). */
  width?: string;
  className?: string;
}

export default function MascotAuau({
  layout = DEFAULT_LAYOUT,
  basePath = '/mascot/',
  width,
  className = '',
}: MascotAuauProps) {
  const dogRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const pupilsRef = useRef<HTMLDivElement>(null);
  const lidRef = useRef<HTMLDivElement>(null);
  const [happy, setHappy] = useState(false);

  const C = layout.canvas || { w: 360, h: 380 };
  const base = basePath.replace(/\/?$/, '/');
  const url = (f: string) => base + f;
  const pct = (v: number, total: number) => `${(v / total) * 100}%`;

  const on = Object.entries(layout.pieces).filter(([, p]) => p.on).sort((a, b) => a[1].z - b[1].z);
  const free = on.filter(([k]) => !HEAD_GROUP.includes(k));
  const headPieces = on.filter(([k]) => HEAD_GROUP.includes(k));
  const maxFree = Math.max(0, ...free.map(([, p]) => p.z));

  const hp = layout.pieces.head;
  const Nx = hp ? hp.x + hp.w / 2 : C.w / 2;
  const Ny = hp ? hp.y + (hp.w * NAT.head[1] / NAT.head[0]) * 0.95 : C.h * 0.52;

  const posStyle = (p: Piece): React.CSSProperties => ({
    left: pct(p.x, C.w), top: pct(p.y, C.h), width: pct(p.w, C.w), zIndex: p.z,
  });

  useEffect(() => {
    const dog = dogRef.current, head = headRef.current;
    const pupils = pupilsRef.current, lid = lidRef.current;
    if (!dog || !head) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const MAXH = 8, MAXP = 6, EASE = 0.12, TILT = 5;
    let tH = 0, cH = 0, cT = 0, tx = 0, cx = 0, ty = 0, cy = 0;
    let cX = innerWidth / 2, cY = innerHeight / 2, scl = 1;
    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
    const measure = () => {
      const r = dog.getBoundingClientRect();
      cX = r.left + r.width / 2; cY = r.top + r.height / 2; scl = r.width / C.w;
    };
    measure();

    const onMove = (e: MouseEvent) => {
      const nx = clamp((e.clientX - cX) / (innerWidth * 0.5), -1, 1);
      const ny = clamp((e.clientY - cY) / (innerHeight * 0.5), -1, 1);
      tH = nx * MAXH; tx = nx * MAXP; ty = ny * MAXP;
      const dist = Math.hypot(e.clientX - cX, e.clientY - cY);
      const near = clamp(1 - dist / (innerWidth * 0.55), 0, 1);
      dog.style.setProperty('--m-wag', `${(0.6 - near * 0.36).toFixed(3)}s`);
    };

    let raf = 0;
    const tick = () => {
      const tT = dog.classList.contains('happy') ? -TILT : 0;
      cH += (tH - cH) * EASE; cT += (tT - cT) * EASE;
      cx += (tx - cx) * EASE; cy += (ty - cy) * EASE;
      head.style.transform = `rotate(${(cH + cT).toFixed(3)}deg)`;
      if (pupils) pupils.style.transform = `translate(${(cx * scl).toFixed(2)}px, ${(cy * scl).toFixed(2)}px)`;
      raf = requestAnimationFrame(tick);
    };

    let blinkT: ReturnType<typeof setTimeout>;
    const blink = () => {
      if (lid) { lid.classList.add('blink'); setTimeout(() => lid.classList.remove('blink'), 120); }
      blinkT = setTimeout(blink, 3000 + Math.random() * 4000);
    };

    if (!reduce) {
      addEventListener('mousemove', onMove, { passive: true });
      addEventListener('resize', measure);
      addEventListener('scroll', measure, { passive: true });
      raf = requestAnimationFrame(tick);
      blinkT = setTimeout(blink, 2000 + Math.random() * 3000);
    }
    return () => {
      cancelAnimationFrame(raf); clearTimeout(blinkT);
      removeEventListener('mousemove', onMove);
      removeEventListener('resize', measure);
      removeEventListener('scroll', measure);
    };
  }, [C.w, C.h]);

  const renderPiece = ([key, p]: [string, Piece]) => {
    if (key === 'eyes') {
      const [b, pup] = FILES.eyes as [string, string];
      return (
        <div key="eyes" className="m-eyes"
             style={{ ...posStyle(p), aspectRatio: `${NAT.eyes[0]} / ${NAT.eyes[1]}` }}>
          <div className="m-eyes-scale">
            <div className="m-eyelid" ref={lidRef}>
              <img className="m-fill" src={url(b)} alt="" draggable={false} />
              <div className="m-pupils" ref={pupilsRef}>
                <img className="m-fill" src={url(pup)} alt="" draggable={false} />
              </div>
            </div>
          </div>
        </div>
      );
    }
    const file = FILES[key] as string;
    if (!file) return null;
    return (
      <img key={key} className={`m-layer ${ANIM[key] || ''}`} style={posStyle(p)}
           src={url(file)} alt="" draggable={false} />
    );
  };

  return (
    <div
      ref={dogRef}
      className={`m-dog ${happy ? 'happy' : ''} ${className}`}
      style={width ? ({ ['--m-w' as string]: width } as React.CSSProperties) : undefined}
      onMouseEnter={() => setHappy(true)}
      onMouseLeave={() => setHappy(false)}
      role="img"
      aria-label="Auau, o mascote do Cantinho do AUAU"
    >
      {free.map(renderPiece)}
      <div
        className="m-head"
        ref={headRef}
        style={{ transformOrigin: `${pct(Nx, C.w)} ${pct(Ny, C.h)}`, zIndex: maxFree + 1 }}
      >
        {headPieces.map(renderPiece)}
      </div>
    </div>
  );
}
