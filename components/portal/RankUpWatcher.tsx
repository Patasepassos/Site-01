"use client";

import { useEffect, useRef } from "react";
import { playRankUpSound } from "@/lib/portal/sound";
import { useToast } from "./ToastProvider";

const STORAGE_PREFIX = "pp_last_rank_";

/**
 * Detecta subida REAL de Rank comparando com o último nível visto
 * (guardado no localStorage deste navegador). Só dispara som/toast quando
 * o nível atual é de fato maior que o último registrado -- nunca simula.
 */
export default function RankUpWatcher({
  partnerId,
  currentTierKey,
  currentTierLabel,
  currentTierEmoji,
  sortOrder,
}: {
  partnerId: string;
  currentTierKey: string;
  currentTierLabel: string;
  currentTierEmoji: string;
  sortOrder: number;
}) {
  const showToast = useToast();
  const fired = useRef(false);

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
      playRankUpSound();
      showToast(`🎉 PARABÉNS! Você subiu para o nível ${currentTierEmoji} ${currentTierLabel}!`);
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify({ key: currentTierKey, sortOrder }));
    } catch {
      // localStorage indisponível (ex.: modo privado) -- só não guarda, sem quebrar a página
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerId, currentTierKey, sortOrder]);

  return null;
}
