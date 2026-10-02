"use client";

import { useEffect, useRef, useState } from "react";
import RankUpIntro from "./RankUpIntro";
import type { RankKey } from "@/lib/supabase/types";

const STORAGE_PREFIX = "pp_last_rank_";

/**
 * Detecta subida REAL de Rank comparando com o último nível visto (guardado
 * no localStorage deste navegador). Só dispara a tela de evolução
 * (RankUpIntro -- mesmo componente usado no cadastro) quando o nível atual é
 * de fato maior que o último registrado -- nunca simula. RankUpIntro já
 * cuida do som e dos efeitos visuais por nível; esse componente só decide
 * QUANDO mostrar.
 */
export default function RankUpWatcher({
  partnerId,
  currentTierKey,
  sortOrder,
}: {
  partnerId: string;
  currentTierKey: RankKey;
  sortOrder: number;
}) {
  const fired = useRef(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const storageKey = `${STORAGE_PREFIX}${partnerId}`;
    let lastSortOrder: number | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      lastSortOrder = raw ? Number(JSON.parse(raw).sortOrder) : null;
    } catch {
      lastSortOrder = null;
    }

    if (lastSortOrder !== null && sortOrder > lastSortOrder) {
      setShowIntro(true);
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify({ key: currentTierKey, sortOrder }));
    } catch {
      // localStorage indisponível (ex.: modo privado) -- só não guarda, sem quebrar a página
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, currentTierKey, sortOrder]);

  if (!showIntro) return null;
  return <RankUpIntro rankKey={currentTierKey} onClose={() => setShowIntro(false)} />;
}
