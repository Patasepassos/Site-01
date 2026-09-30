import type { RankTierRow } from "@/lib/supabase/types";

const LED_CLASS: Record<string, string> = {
  none: "",
  static: "rank-led-static",
  pulse_gold: "rank-led-pulse-gold",
  neon: "rank-led-neon",
  aura: "rank-led-aura",
};

export default function RankGrid({
  tiers,
  activeClients,
  currentTierId,
}: {
  tiers: RankTierRow[];
  activeClients: number;
  currentTierId: string | null;
}) {
  return (
    <div className="rank-box-grid">
      {tiers.map((tier) => {
        const unlocked = activeClients >= tier.min_clients;
        const isCurrent = tier.id === currentTierId;
        const remaining = Math.max(0, tier.min_clients - activeClients);
        return (
          <div
            key={tier.id}
            className={`rank-box${unlocked ? " unlocked" : ""}${isCurrent ? " current" : ""} ${LED_CLASS[tier.led_style] ?? ""}`}
          >
            <div className="rank-box-icon">{tier.emoji}</div>
            <div className="rank-box-title">
              {tier.label}
              {isCurrent && <span className="rank-box-you"> (você)</span>}
            </div>
            <div className="rank-box-bonus">{tier.bonus_text}</div>
            {!unlocked && (
              <div className="rank-box-req">{remaining} {remaining === 1 ? "cliente" : "clientes"} pra desbloquear</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
