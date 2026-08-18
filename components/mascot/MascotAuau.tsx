"use client";

import { useEffect, useRef } from "react";

/* ===== Porte fiel de MascotAuau (pacote oficial do mascote) para React =====
   Camadas PNG montadas a partir de um layout em px (base 360×380).
   Comportamentos: cabeça segue o cursor (±8°), pupilas acompanham, pisca,
   respiração, orelhas/língua idle e rabo que abana (acelera com proximidade).
   Respeita prefers-reduced-motion. */

type Piece = { x: number; y: number; w: number; z: number; on: boolean };

const DEFAULT_LAYOUT: { canvas: { w: number; h: number }; pieces: Record<string, Piece> } = {
  canvas: { w: 360, h: 380 },
  pieces: {
    tail: { x: 208, y: 232, w: 53, z: 1, on: true },
    body: { x: 70, y: 175, w: 175, z: 2, on: true },
    body_notail: { x: 94, y: 150, w: 175, z: 2, on: false },
    head: { x: 43, y: 49, w: 185, z: 3, on: true },
    ears: { x: 70, y: 8, w: 174, z: 4, on: false },
    eyes: { x: 87, y: 94, w: 96, z: 5, on: true },
    mouth: { x: 98, y: 139, w: 75, z: 6, on: true },
    tongue: { x: 123, y: 171, w: 26, z: 7, on: true },
  },
};

const FILES: Record<string, string | string[]> = {
  tail: "tail_edit.png",
  body: "body_edit.png",
  body_notail: "body_notail.png",
  head: "02_head.png",
  ears: "04_ears.png",
  eyes: ["eyes_base.png", "eyes_pupils.png"],
  mouth: "mouth_edit.png",
  tongue: "06_tongue.png",
};

const NAT: Record<string, [number, number]> = {
  tail: [76, 104],
  body: [175, 150],
  body_notail: [175, 150],
  head: [185, 149],
  ears: [174, 100],
  eyes: [123, 54],
  mouth: [130, 84],
  tongue: [60, 47],
};

const HEAD_GROUP = ["ears", "head", "eyes", "mouth", "tongue"];
const ANIM: Record<string, string> = {
  tail: "m-tail",
  body: "m-body",
  body_notail: "m-body",
  ears: "m-ears",
  tongue: "m-tongue",
};

export default function MascotAuau({ width = "clamp(280px, 30vw, 430px)" }: { width?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;
    mountEl.innerHTML = ""; // idempotente sob React Strict Mode

    const layout = DEFAULT_LAYOUT;
    const base = "/mascot/";
    const C = layout.canvas;
    const url = (f: string) => base + f;
    const pct = (v: number, t: number) => (v / t) * 100 + "%";

    const on = Object.keys(layout.pieces)
      .map((k) => [k, layout.pieces[k]] as [string, Piece])
      .filter((e) => e[1].on)
      .sort((a, b) => a[1].z - b[1].z);
    const free = on.filter((e) => HEAD_GROUP.indexOf(e[0]) < 0);
    const headPieces = on.filter((e) => HEAD_GROUP.indexOf(e[0]) >= 0);
    const maxFree = Math.max.apply(null, [0].concat(free.map((e) => e[1].z)));

    const hp = layout.pieces.head;
    const Nx = hp ? hp.x + hp.w / 2 : C.w / 2;
    const Ny = hp ? hp.y + ((hp.w * NAT.head[1]) / NAT.head[0]) * 0.95 : C.h * 0.52;

    const dog = document.createElement("div");
    dog.className = "m-dog";
    dog.setAttribute("role", "img");
    dog.setAttribute("aria-label", "Mascote da Patas & Passos");
    dog.style.setProperty("--m-w", width);

    let lidEl: HTMLElement | null = null;
    let pupilsEl: HTMLElement | null = null;

    const posStyle = (el: HTMLElement, p: Piece) => {
      el.style.left = pct(p.x, C.w);
      el.style.top = pct(p.y, C.h);
      el.style.width = pct(p.w, C.w);
      el.style.zIndex = String(p.z);
    };

    const renderPiece = (key: string, p: Piece, parent: HTMLElement) => {
      if (key === "eyes") {
        const eyeFiles = FILES.eyes as string[];
        const wrap = document.createElement("div");
        wrap.className = "m-eyes";
        posStyle(wrap, p);
        wrap.style.aspectRatio = NAT.eyes[0] + " / " + NAT.eyes[1];
        const sc = document.createElement("div");
        sc.className = "m-eyes-scale";
        const lid = document.createElement("div");
        lid.className = "m-eyelid";
        lidEl = lid;
        const ib = document.createElement("img");
        ib.className = "m-fill";
        ib.src = url(eyeFiles[0]);
        ib.alt = "";
        ib.draggable = false;
        const pupils = document.createElement("div");
        pupils.className = "m-pupils";
        pupilsEl = pupils;
        const ip = document.createElement("img");
        ip.className = "m-fill";
        ip.src = url(eyeFiles[1]);
        ip.alt = "";
        ip.draggable = false;
        pupils.appendChild(ip);
        lid.appendChild(ib);
        lid.appendChild(pupils);
        sc.appendChild(lid);
        wrap.appendChild(sc);
        parent.appendChild(wrap);
        return;
      }
      const file = FILES[key] as string;
      if (!file) return;
      const img = document.createElement("img");
      img.className = "m-layer " + (ANIM[key] || "");
      img.src = url(file);
      img.alt = "";
      img.draggable = false;
      posStyle(img, p);
      parent.appendChild(img);
    };

    free.forEach((e) => renderPiece(e[0], e[1], dog));
    const head = document.createElement("div");
    head.className = "m-head";
    head.style.transformOrigin = pct(Nx, C.w) + " " + pct(Ny, C.h);
    head.style.zIndex = String(maxFree + 1);
    headPieces.forEach((e) => renderPiece(e[0], e[1], head));
    dog.appendChild(head);
    mountEl.appendChild(dog);

    const onEnter = () => dog.classList.add("happy");
    const onLeave = () => dog.classList.remove("happy");
    dog.addEventListener("mouseenter", onEnter);
    dog.addEventListener("mouseleave", onLeave);

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MAXH = 8,
      MAXP = 6,
      EASE = 0.12,
      TILT = 5;
    let tH = 0,
      cH = 0,
      cT = 0,
      tx = 0,
      cx = 0,
      ty = 0,
      cy = 0;
    let cX = innerWidth / 2,
      cY = innerHeight / 2,
      scl = 1;
    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
    const measure = () => {
      const r = dog.getBoundingClientRect();
      cX = r.left + r.width / 2;
      cY = r.top + r.height / 2;
      scl = r.width / C.w;
    };
    measure();

    const onMove = (e: MouseEvent) => {
      const nx = clamp((e.clientX - cX) / (innerWidth * 0.5), -1, 1);
      const ny = clamp((e.clientY - cY) / (innerHeight * 0.5), -1, 1);
      tH = nx * MAXH;
      tx = nx * MAXP;
      ty = ny * MAXP;
      const dist = Math.hypot(e.clientX - cX, e.clientY - cY);
      const near = clamp(1 - dist / (innerWidth * 0.55), 0, 1);
      dog.style.setProperty("--m-wag", (0.6 - near * 0.36).toFixed(3) + "s");
    };

    let raf = 0;
    const tick = () => {
      const tT = dog.classList.contains("happy") ? -TILT : 0;
      cH += (tH - cH) * EASE;
      cT += (tT - cT) * EASE;
      cx += (tx - cx) * EASE;
      cy += (ty - cy) * EASE;
      head.style.transform = "rotate(" + (cH + cT).toFixed(3) + "deg)";
      if (pupilsEl)
        pupilsEl.style.transform =
          "translate(" + (cx * scl).toFixed(2) + "px," + (cy * scl).toFixed(2) + "px)";
      raf = requestAnimationFrame(tick);
    };

    let blinkT: ReturnType<typeof setTimeout> | undefined;
    const blink = () => {
      if (lidEl) {
        lidEl.classList.add("blink");
        setTimeout(() => lidEl && lidEl.classList.remove("blink"), 120);
      }
      blinkT = setTimeout(blink, 3000 + Math.random() * 4000);
    };

    if (!reduce) {
      addEventListener("mousemove", onMove, { passive: true });
      addEventListener("resize", measure);
      addEventListener("scroll", measure, { passive: true });
      raf = requestAnimationFrame(tick);
      blinkT = setTimeout(blink, 2000 + Math.random() * 3000);
    }

    return () => {
      removeEventListener("mousemove", onMove);
      removeEventListener("resize", measure);
      removeEventListener("scroll", measure);
      if (raf) cancelAnimationFrame(raf);
      if (blinkT) clearTimeout(blinkT);
      dog.removeEventListener("mouseenter", onEnter);
      dog.removeEventListener("mouseleave", onLeave);
      mountEl.innerHTML = "";
    };
  }, [width]);

  return <div ref={mountRef} style={{ display: "grid", placeItems: "center" }} />;
}
