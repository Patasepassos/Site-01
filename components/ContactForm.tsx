"use client";

import { useState } from "react";
import { siteConfig, waLink } from "@/lib/site";

const STEPS = [
  { id: "nome",    q: "Qual o nome do seu companheiro?",     placeholder: "Ex: Thor, Luna…",    field: "nome" },
  { id: "servico", q: "Qual serviço você precisa?",          placeholder: "",                   field: "servico",
    options: ["🐾 Passeios (Dog Walker)", "🐕 Socialização", "🏡 Pet Sitter", "🏠 Hotel", "💉 Vacinas a domicílio"] },
  { id: "quando",  q: "Quando você quer começar?",           placeholder: "Ex: essa semana, próximo mês…", field: "quando" },
  { id: "tutor",   q: "Qual é o seu nome?",                 placeholder: "Ex: Ana, Carlos…",   field: "tutor" },
];

export default function ContactForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [val, setVal] = useState("");

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function advance() {
    if (!val.trim()) return;
    const next = { ...data, [current.field]: val };
    setData(next);
    setVal("");
    if (isLast) {
      const msg = `Olá! 🐾 Vim pelo site da Patas & Passos.\n\n🐶 Pet: ${next.nome}\n🔧 Serviço: ${next.servico}\n📅 Quando: ${next.quando}\n👤 Tutor(a): ${next.tutor}\n\nQuero saber mais!`;
      window.open(waLink(msg), "_blank", "noopener");
    } else {
      setStep(step + 1);
    }
  }

  return (
    <section className="contact-section" id="contato">
      <div className="contact-inner">

        {/* Left */}
        <div className="contact-left">
          <span className="eyebrow">Vamos conversar</span>
          <h2 className="h-lg" style={{ marginTop: 10 }}>
            Agende o primeiro <span className="hl">passo</span>
          </h2>
          <p className="lead" style={{ marginTop: 14 }}>
            Preencha o formulário ao lado ou entre em contato direto pelo WhatsApp. Respondemos em minutos!
          </p>

          <div className="contact-info">
            <div className="ci-row">
              <span className="ci-icon">📞</span>
              <div>
                <p className="ci-label">WhatsApp</p>
                <a className="ci-val" href={waLink("Olá! Vim pelo site da Patas & Passos.")} target="_blank" rel="noopener">
                  {siteConfig.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="ci-row">
              <span className="ci-icon">📍</span>
              <div>
                <p className="ci-label">Região de Atendimento</p>
                <p className="ci-val">{siteConfig.city}</p>
              </div>
            </div>
            <div className="ci-row">
              <span className="ci-icon">🕐</span>
              <div>
                <p className="ci-label">Horários</p>
                <p className="ci-val">{siteConfig.hours}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right — form card */}
        <div className="contact-card">
          {/* Progress bar */}
          <div className="cf-progress">
            {STEPS.map((_, i) => (
              <div key={i} className={`cf-bar${i <= step ? " cf-bar-on" : ""}`} />
            ))}
          </div>

          <div className="cf-paw" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 64 64" fill="var(--blue)">
              <g><ellipse cx="32" cy="42" rx="18" ry="15" /><ellipse cx="14" cy="26" rx="7.5" ry="10" />
              <ellipse cx="28" cy="17" rx="7.5" ry="10.5" /><ellipse cx="44" cy="18" rx="7.5" ry="10.5" />
              <ellipse cx="55" cy="29" rx="7" ry="9.5" /></g>
            </svg>
          </div>

          <p className="cf-question">{current.q}</p>

          {current.options ? (
            <div className="cf-options">
              {current.options.map((opt) => (
                <button
                  key={opt}
                  className={`cf-opt${val === opt ? " cf-opt-on" : ""}`}
                  onClick={() => setVal(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <input
              className="cf-input"
              type="text"
              placeholder={current.placeholder}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && advance()}
              autoFocus
            />
          )}

          <button className="cf-next" onClick={advance} disabled={!val.trim()}>
            {isLast ? "Enviar pelo WhatsApp →" : "Continuar →"}
          </button>

          <p className="cf-step">{step + 1} de {STEPS.length}</p>
        </div>
      </div>
    </section>
  );
}
