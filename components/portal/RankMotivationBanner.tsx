"use client";

import { useEffect, useState } from "react";
import { RANK_IMAGE } from "@/lib/partners/rankTheme";
import { RANK_FLAVOR } from "@/lib/partners/rankFlavor";
import type { RankKey } from "@/lib/supabase/types";

const STORAGE_PREFIX = "pp_hide_rank_motivation_";

/**
 * Lembrete pequeno do significado do Rank atual, mostrado toda vez que o
 * parceiro loga (topo do dashboard) -- diferente do RankUpIntro (a tela
 * gigante), que só aparece numa subida de nível real. Aqui é só a frase
 * motivacional + o emblema, com uma caixinha "Não mostrar novamente": ao
 * marcar, some na hora e nunca mais aparece nesse navegador (guardado por
 * parceiro, igual ao padrão de RankUpWatcher).
 */
export default function RankMotivationBanner({ partnerId, rankKey }: { partnerId: string; rankKey: RankKey }) {
  const storageKey = `${STORAGE_PREFIX}${partnerId}`;
  // Começa oculto até confirmar no client (localStorage não existe no
  // servidor) -- evita mostrar e sumir na hora se o parceiro já dispensou.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(storageKey) !== "1");
    } catch {
      setVisible(true);
    }
  }, [storageKey]);

  function handleDismissForever() {
    setVisible(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // localStorage indisponível (ex.: modo privado) -- só não persiste, sem quebrar a página
    }
  }

  if (!visible) return null;
  const flavor = RANK_FLAVOR[rankKey];

  return (
    <div className="rank-motivation-box">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rank-motivation-emblem" src={RANK_IMAGE[rankKey]} alt="" />
      <p className="rank-motivation-text">{flavor.headline}</p>
      <label className="rank-motivation-dismiss">
        <input type="checkbox" onChange={(e) => e.target.checked && handleDismissForever()} />
        Não mostrar novamente
      </label>
    </div>
  );
}
