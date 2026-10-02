"use client";

import { useEffect, useRef } from "react";
import { playHoverSound } from "@/lib/portal/sound";

const INTERACTIVE_SELECTOR =
  "button, .btn, .btn-copy, .avatar-menu-trigger, .avatar-menu-item, .pbn-item, .portal-nav-desktop a, .pf-submit";

/**
 * Som sutil ao passar o mouse num botão/link de interação -- delegado num
 * único listener (em vez de um onMouseEnter por componente) pra funcionar em
 * toda a área do parceiro sem precisar tocar em cada botão. Dispara só uma
 * vez por elemento (compara com o último elemento sob o cursor), nunca a
 * cada pixel de movimento.
 */
export default function HoverSoundListener() {
  const lastEl = useRef<Element | null>(null);

  useEffect(() => {
    function onMouseOver(e: MouseEvent) {
      const target = (e.target as Element | null)?.closest?.(INTERACTIVE_SELECTOR) ?? null;
      if (target && target !== lastEl.current) {
        playHoverSound();
      }
      lastEl.current = target;
    }
    document.addEventListener("mouseover", onMouseOver);
    return () => document.removeEventListener("mouseover", onMouseOver);
  }, []);

  return null;
}
