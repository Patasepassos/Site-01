"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { RANK_IMAGE, RANK_THEME } from "@/lib/partners/rankTheme";
import { RANK_FLAVOR } from "@/lib/partners/rankFlavor";
import { playRankUpSound } from "@/lib/sound/rankUp";
import type { RankKey } from "@/lib/supabase/types";

const RANK_LABEL: Record<RankKey, string> = {
  filhote: "Filhote",
  companheiro: "Companheiro",
  lion_ouro: "Lion de Ouro",
  tigre_platina: "Tigre Platina",
  wolf_lenda: "Wolf Lenda Plus",
};

/** Filhote precisa ser quase instantâneo (sensação de conquista imediata); níveis
 * maiores ganham uma subida mais longa e "épica" -- ver lib/sound/rankUp.ts pro
 * mesmo princípio aplicado ao som. */
const POP_DURATION_MS: Record<RankKey, number> = {
  filhote: 700,
  companheiro: 950,
  lion_ouro: 1200,
  tigre_platina: 1300,
  wolf_lenda: 1500,
};

const CLOSE_DURATION_MS = 380;

type RankUpStyle = CSSProperties & {
  "--rk-c1"?: string;
  "--rk-c2"?: string;
  "--rk-glow"?: string;
  "--rk-pop-duration"?: string;
};

/**
 * Tela de evolução de Rank (usada hoje na confirmação de cadastro, pro
 * Filhote de boas-vindas). Sequência: o emblema "sobe" de um ponto minúsculo
 * até ficar gigante com uma onda de impacto, assentando no tamanho final --
 * com um anel neon perseguindo a própria cauda ao redor dele (estilo jogo da
 * cobrinha) e raios de luz girando atrás, estilo "farol". Fecha com fade
 * suave ao clicar em "Ok".
 */
export default function RankUpIntro({ rankKey, onClose }: { rankKey: RankKey; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const theme = RANK_THEME[rankKey];
  const flavor = RANK_FLAVOR[rankKey];
  const popDuration = POP_DURATION_MS[rankKey];

  useEffect(() => {
    playRankUpSound(rankKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, CLOSE_DURATION_MS);
  }

  const style: RankUpStyle = {
    "--rk-c1": theme.c1,
    "--rk-c2": theme.c2,
    "--rk-glow": theme.glow,
    "--rk-pop-duration": `${popDuration}ms`,
  };

  // Comprimento total do anel neon (SVG viewBox 0 0 160 160, raio 68) --
  // usado pro stroke-dasharray/dashoffset do "cometa" que roda ao redor.
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const cometLength = circumference * 0.22;

  return (
    <div className={`rankup-overlay${closing ? " closing" : ""}`} style={style} role="dialog" aria-modal="true" aria-label={`Você evoluiu para ${RANK_LABEL[rankKey]}`}>
      {/* Raios de luz girando atrás de tudo -- efeito "farol"/God Rays via
          repeating-conic-gradient (listras claras alternadas) + rotação CSS. */}
      <div className={`rankup-rays${theme.rainbow ? " rainbow" : ""}`} aria-hidden="true" />
      <div className="rankup-rays rankup-rays-soft" aria-hidden="true" />

      <div className="rankup-stage">
        {/* Onda de choque: um anel que nasce no centro e se expande sumindo,
            disparado bem no instante do impacto (metade da animação de pop). */}
        <div className="rankup-shock" aria-hidden="true" />

        <div className="rankup-emblem-wrap">
          {/* Anel neon duplo: uma camada desfocada (glow) atrás de uma linha
              nítida -- as duas com um "cometa" (dash parcial) que roda sem
              parar ao redor do emblema, igual a cobrinha dando a volta. */}
          <svg className={`rankup-ring${theme.rainbow ? " rainbow" : ""}`} viewBox="0 0 160 160" aria-hidden="true">
            <circle className="rankup-ring-track" cx="80" cy="80" r={radius} />
            <circle
              className="rankup-ring-glow"
              cx="80"
              cy="80"
              r={radius}
              strokeDasharray={`${cometLength} ${circumference - cometLength}`}
            />
            <circle
              className="rankup-ring-comet"
              cx="80"
              cy="80"
              r={radius}
              strokeDasharray={`${cometLength} ${circumference - cometLength}`}
            />
          </svg>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="rankup-emblem" src={RANK_IMAGE[rankKey]} alt={RANK_LABEL[rankKey]} />
        </div>

        <p className="rankup-eyebrow">Novo nível desbloqueado</p>
        <h2 className="rankup-title">{RANK_LABEL[rankKey]}</h2>
        <p className="rankup-headline">{flavor.headline}</p>
        <p className="rankup-body">{flavor.body}</p>

        <button type="button" className="rankup-ok" onClick={handleClose}>
          Ok
        </button>
      </div>
    </div>
  );
}
