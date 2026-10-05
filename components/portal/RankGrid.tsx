import type { CSSProperties } from "react";
import type { RankTierRow } from "@/lib/supabase/types";
import { RANK_IMAGE, RANK_THEME } from "@/lib/partners/rankTheme";

type RankRingStyle = CSSProperties & { "--rc1"?: string; "--rc2"?: string; "--rc-glow"?: string };

export default function RankGrid({
  tiers,
  activeClients,
  currentTierId,
}: {
  tiers: RankTierRow[];
  activeClients: number;
  currentTierId: string | null;
}) {
  if (tiers.length === 0) {
    return (
      <p style={{ fontSize: 13.5, color: "rgba(245,239,230,.6)" }}>
        Os níveis de Rank estão temporariamente indisponíveis. Isso não afeta suas indicações nem suas comissões —
        já avisamos a equipe.
      </p>
    );
  }

  return (
    <div className="rank-showcase">
      {tiers.map((tier) => {
        const unlocked = activeClients >= tier.min_clients;
        const isCurrent = tier.id === currentTierId;
        const remaining = Math.max(0, tier.min_clients - activeClients);
        const theme = RANK_THEME[tier.key];
        const ringStyle: RankRingStyle = { "--rc1": theme.c1, "--rc2": theme.c2, "--rc-glow": theme.glow };
        return (
          <div key={tier.id} className={`rank-tier-card${unlocked ? " unlocked" : ""}${isCurrent ? " current" : ""}`}>
            <div
              className={`rank-tier-icon rank-ring${unlocked ? " unlocked" : ""}${isCurrent ? " current" : ""}${theme.rainbow ? " rainbow" : ""}`}
              style={ringStyle}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tier.photo_url || RANK_IMAGE[tier.key]}
                alt={tier.label}
                className="rank-emblem-img"
              />
            </div>
            <div className="rank-tier-body">
              <div className="rank-tier-head">
                <span className="rank-tier-name">{tier.label}</span>
                {isCurrent && <span className="rank-tier-tag">SEU NÍVEL ATUAL</span>}
              </div>
              <p className="rank-tier-desc">{tier.bonus_text}</p>
              {!unlocked && (
                <p className="rank-tier-req">
                  🐾 Desbloqueie com {tier.min_clients} clientes ativos — faltam {remaining}{" "}
                  {remaining === 1 ? "cliente" : "clientes"}.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
