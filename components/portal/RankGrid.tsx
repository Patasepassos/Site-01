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
    <div className="rank-showcase">
      {tiers.map((tier) => {
        const unlocked = activeClients >= tier.min_clients;
        const isCurrent = tier.id === currentTierId;
        const remaining = Math.max(0, tier.min_clients - activeClients);
        return (
          <div
            key={tier.id}
            className={`rank-tier-card${unlocked ? " unlocked" : ""}${isCurrent ? " current" : ""} ${LED_CLASS[tier.led_style] ?? ""}`}
          >
            <div className="rank-tier-icon">
              {tier.photo_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={tier.photo_url} alt={tier.label} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              ) : (
                tier.emoji
              )}
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
