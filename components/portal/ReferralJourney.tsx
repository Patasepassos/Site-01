const STEPS = [
  { emoji: "🟡", label: "Em atendimento" },
  { emoji: "🎉", label: "Venda fechada" },
  { emoji: "💰", label: "Comissão liberada" },
];

/** stage: 1 = indicação ainda em atendimento, 2 = venda fechada, 3 = comissão liberada/paga. */
export default function ReferralJourney({ stage }: { stage: 1 | 2 | 3 }) {
  return (
    <div className="journey journey-compact">
      {STEPS.map((step, i) => {
        const n = i + 1;
        const done = n < stage;
        const current = n === stage;
        return (
          <div key={step.label} style={{ display: "contents" }}>
            {i > 0 && <div className={`journey-line${n <= stage ? " done" : ""}`} />}
            <div
              className={`journey-dot${done || current ? " done" : ""}${current ? " final" : ""}`}
              title={step.label}
            >
              {step.emoji}
            </div>
          </div>
        );
      })}
    </div>
  );
}
