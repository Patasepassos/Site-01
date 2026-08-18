"use client";

import { useEffect, useRef } from "react";

/** Bolhas que sobem dentro do placeholder do hero de Banho & Tosa. */
export default function Bubbles() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    box.innerHTML = ""; // idempotente sob React Strict Mode
    for (let i = 0; i < 14; i++) {
      const b = document.createElement("i");
      const s = 8 + Math.random() * 22;
      b.style.width = s + "px";
      b.style.height = s + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDuration = 5 + Math.random() * 6 + "s";
      b.style.animationDelay = Math.random() * 6 + "s";
      box.appendChild(b);
    }
    return () => {
      box.innerHTML = "";
    };
  }, []);

  return <div className="bubbles" aria-hidden="true" ref={ref} />;
}
