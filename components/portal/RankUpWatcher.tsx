"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import RankUpIntro from "./RankUpIntro";
import { RANK_THEME } from "@/lib/partners/rankTheme";
import type { RankKey } from "@/lib/supabase/types";

const STORAGE_PREFIX = "pp_last_rank_";

function isRankKey(value: string | null): value is RankKey {
  return Boolean(value) && value! in RANK_THEME;
}

/**
 * Detecta subida REAL de Rank comparando com o último nível visto (guardado
 * no localStorage deste navegador). Só dispara a tela de evolução
 * (RankUpIntro -- mesmo componente usado no cadastro) quando o nível atual é
 * de fato maior que o último registrado -- nunca simula. Na primeiríssima
 * visita ao dashboard não existe ainda um "último nível visto" pra comparar
 * -- esse acesso só grava a base, sem mostrar nada; é no acesso seguinte,
 * depois de uma subida de verdade, que a tela aparece.
 *
 * Pra testar a animação de qualquer nível sem precisar subir de rank de
 * verdade, acrescente ?previewRank=<key> na URL do dashboard (ex.:
 * ?previewRank=wolf_lenda) -- mostra a tela imediatamente, sem mexer no
 * histórico salvo no localStorage.
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
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const searchParams = useSearchParams();
  const previewParam = searchParams.get("previewRank");
  const previewKey = isRankKey(previewParam) ? previewParam : null;

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

  if (previewKey && !previewDismissed) {
    return <RankUpIntro rankKey={previewKey} onClose={() => setPreviewDismissed(true)} />;
  }

  if (!showIntro) return null;
  return <RankUpIntro rankKey={currentTierKey} onClose={() => setShowIntro(false)} />;
}
