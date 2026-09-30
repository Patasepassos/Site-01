"use client";

import { useState } from "react";
import type { RankTierRow } from "@/lib/supabase/types";

const LED_CLASS: Record<string, string> = {
  none: "",
  static: "rank-led-static",
  pulse_gold: "rank-led-pulse-gold",
  neon: "rank-led-neon",
  aura: "rank-led-aura",
};

export default function RankLadder({
  tiers,
  activeClients,
  currentTierId,
}: {
  tiers: RankTierRow[];
  activeClients: number;
  currentTierId: string | null;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="rank-ladder">
      {tiers.map((tier, i) => {
        const unlocked = activeClients >= tier.min_clients;
        const prevUnlocked = i > 0 && activeClients >= tiers[i - 1].min_clients;
        const isCurrent = tier.id === currentTierId;
        const remaining = Math.max(0, tier.min_clients - activeClients);

        return (
          <div className="rank-ladder-item" key={tier.id}>
            {i > 0 && <div className={`rank-ladder-line${prevUnlocked ? " done" : ""}`} />}
            <button
              type="button"
              className={`rank-paw${unlocked ? " unlocked" : ""}${isCurrent ? " current" : ""} ${LED_CLASS[tier.led_style] ?? ""}`}
              onClick={() => setOpenId((id) => (id === tier.id ? null : tier.id))}
              aria-label={`${tier.emoji} ${tier.label}`}
            >
              🐾
            </button>
            <div className={`rank-tooltip${openId === tier.id ? " is-open" : ""}`}>
              <b>{tier.emoji} {tier.label.toUpperCase()}</b>
              {unlocked ? (
                <p>{tier.bonus_text}</p>
              ) : (
                <>
                  <p>Desbloqueie com {tier.min_clients} clientes ativos.</p>
                  <p>Faltam {remaining} {remaining === 1 ? "cliente" : "clientes"}.</p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
