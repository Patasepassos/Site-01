import Link from "next/link";
import MascotAuau from "@/components/mascot/MascotAuau";
import { waLink, waMessages } from "@/lib/site";

const Paw = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <g fill="currentColor">
      <ellipse cx="32" cy="42" rx="18" ry="15" />
      <ellipse cx="14" cy="26" rx="7.5" ry="10" />
      <ellipse cx="28" cy="17" rx="7.5" ry="10.5" />
      <ellipse cx="44" cy="18" rx="7.5" ry="10.5" />
      <ellipse cx="55" cy="29" rx="7" ry="9.5" />
    </g>
  </svg>
);

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16 4C9.9 4 5 8.9 5 15c0 2.1.6 4.1 1.7 5.8L5 27l6.4-1.7c1.6.9 3.5 1.4 5.4 1.4 6.1 0 11-4.9 11-11S22.1 4 16 4zm0 20c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.8 1 1-3.7-.2-.4C7 18.7 6.5 16.9 6.5 15 6.5 9.8 10.8 5.5 16 5.5S25.5 9.8 25.5 15 21.2 24 16 24zm5.3-6.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

export default function Home() {
  const wa = waLink(waMessages.default);
  const waVisita = waLink(waMessages.visita);

  return (
    <div className="wrap">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow"><Paw /> São Caetano do Sul · SP</span>
          <h1>
            Mais do que um passeio. Uma jornada de <span className="hl">bem-estar.</span>
          </h1>
          <p className="lead">
            Oferecemos saúde, energia e felicidade para o seu melhor amigo, com passeios seguros e
            personalizados em São Caetano do Sul.
          </p>
          <div className="cta-row">
            <a className="btn btn-blue btn-lg" href={wa} target="_blank" rel="noopener">
              <WaIcon /> Falar no WhatsApp
            </a>
            <Link className="btn btn-white btn-lg" href="/passeios">Conhecer cuidados</Link>
          </div>
          <div className="trust-row">
            <div className="trust-item"><Paw size={16} /> Atendimento local</div>
            <div className="trust-item"><Paw size={16} /> Rotina respeitada</div>
            <div className="trust-item"><Paw size={16} /> Amor &amp; segurança</div>
          </div>
        </div>

        <div className="dog-zone">
          <div className="deco d-circle float-a" style={{ top: "2%", right: "4%" }} />
          <div className="deco d-ring float-b" style={{ top: "20%", right: "0%" }} />
          <div className="deco dotgrid float-b" style={{ top: "6%", left: "2%" }}>
            {Array.from({ length: 15 }).map((_, i) => <i key={i} />)}
          </div>
          <div className="deco dotgrid float-a" style={{ bottom: "8%", right: "6%" }}>
            {Array.from({ length: 15 }).map((_, i) => <i key={i} />)}
          </div>
          <div className="deco d-tile float-a" style={{ left: "0%", top: "46%" }}>
            <svg width="38" height="34" viewBox="0 0 32 30" aria-hidden="true">
              <path d="M16 28 C 2 18 0 9 6 4 c 4 -3 8 -1 10 3 c 2 -4 6 -6 10 -3 c 6 5 4 14 -10 24 Z" fill="#fff" />
            </svg>
          </div>
          <svg className="deco float-b" style={{ bottom: "16%", left: "8%" }} width="120" height="34" viewBox="0 0 120 34" aria-hidden="true">
            <path d="M4 22 Q20 4 38 18 T74 18 T110 16" fill="none" stroke="#A36C43" strokeWidth="6" strokeLinecap="round" />
          </svg>
          <div className="gratis">Primeiro<br />passo</div>
          <div className="blob" />
          <div className="dog-stage"><MascotAuau /></div>
        </div>
      </section>

      {/* ── SOBRE ────────────────────────────────────── */}
      <section className="section" id="sobre">
        <div className="sec-head center reveal">
          <span className="eyebrow">Quem somos</span>
          <h2 className="h-lg">Um casal apaixonado <span className="hl">por animais</span></h2>
        </div>
        <div className="sobre-grid">
          <div className="card reveal" style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--blue)", color: "#fff", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>T</div>
            <h3 className="h-md">Thiago</h3>
            <p style={{ fontSize: 14 }}>Apaixonado por animais, encontrou no cuidado com os pets uma forma de transformar isso em propósito. Garante passeios seguros, equilibrados e felizes.</p>
          </div>
          <div className="card reveal" style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--green)", color: "#fff", fontSize: 26, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>M</div>
            <h3 className="h-md">Mariana</h3>
            <p style={{ fontSize: 14 }}>Veterinária e esposa do Thiago, traz segurança e confiança para o trabalho. Cuida da saúde e bem-estar de cada pet com conhecimento técnico.</p>
          </div>
        </div>
        <div className="sobre-values">
          {[["❤️", "Amor", "Transformamos amor por animais em propósito."],
            ["🎓", "Conhecimento", "Mariana é veterinária — segurança técnica real."],
            ["🏡", "Confiança", "Dedicação total aos pets de São Caetano do Sul."]].map(([e, t, d]) => (
            <div key={t as string} className="card reveal" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{e}</div>
              <h3 className="h-md">{t as string}</h3>
              <p style={{ fontSize: 13 }}>{d as string}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="cta-band reveal">
          <svg className="paw-bg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" fill="#fff" aria-hidden="true">
            <g opacity=".5">
              <ellipse cx="60" cy="150" rx="20" ry="16" /><ellipse cx="40" cy="125" rx="8" ry="11" />
              <ellipse cx="58" cy="116" rx="8" ry="11" /><ellipse cx="78" cy="120" rx="8" ry="11" />
            </g>
            <g opacity=".5">
              <ellipse cx="330" cy="60" rx="20" ry="16" /><ellipse cx="310" cy="35" rx="8" ry="11" />
              <ellipse cx="328" cy="26" rx="8" ry="11" /><ellipse cx="348" cy="30" rx="8" ry="11" />
            </g>
          </svg>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2>Agende o primeiro passo hoje 🐾</h2>
            <p>Entre em contato pelo WhatsApp. Respondemos em minutos!</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={waVisita} target="_blank" rel="noopener">
            Agendar agora
          </a>
        </div>
      </section>

    </div>
  );
}
