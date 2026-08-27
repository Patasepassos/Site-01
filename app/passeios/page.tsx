import type { Metadata } from "next";
import { waLink, waMessages } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Passeios com Dog Walker em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Dog walker em São Caetano do Sul e Santo André — SP: passeios seguros e personalizados. Energia gasta, menos ansiedade e uma rotina de bem-estar.",
  keywords: [
    "dog walker São Caetano do Sul",
    "passeador de cães Santo André",
    "passeio com cachorro",
    "dog walker SP",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Passeios com Dog Walker · Patas & Passos",
    description:
      "Passeios seguros e personalizados em São Caetano do Sul e Santo André. Energia gasta, menos ansiedade.",
    locale: "pt_BR",
    type: "website",
  },
};

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16 4C9.9 4 5 8.9 5 15c0 2.1.6 4.1 1.7 5.8L5 27l6.4-1.7c1.6.9 3.5 1.4 5.4 1.4 6.1 0 11-4.9 11-11S22.1 4 16 4zm0 20c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.8 1 1-3.7-.2-.4C7 18.7 6.5 16.9 6.5 15 6.5 9.8 10.8 5.5 16 5.5S25.5 9.8 25.5 15 21.2 24 16 24zm5.3-6.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

const PawIco = ({ color }: { color: string }) => (
  <svg width="30" height="30" viewBox="0 0 64 64" fill={color} aria-hidden="true">
    <g>
      <ellipse cx="32" cy="42" rx="18" ry="15" />
      <ellipse cx="14" cy="26" rx="7.5" ry="10" />
      <ellipse cx="28" cy="17" rx="7.5" ry="10.5" />
      <ellipse cx="44" cy="18" rx="7.5" ry="10.5" />
      <ellipse cx="55" cy="29" rx="7" ry="9.5" />
    </g>
  </svg>
);

const ICO = { blue: "#71402F", green: "#7A8A54", amber: "#F5C13D", coral: "#A36C43", lilac: "#B99A7B" };

export default function PasseiosPage() {
  const wa = waLink(waMessages.passeios);
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="page-hero-blob" />
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">🐾 Passeios · Dog Walker</span>
          <h1 className="h-xl">
            Energia gasta, dog <span className="hl">feliz</span> e equilibrado
          </h1>
          <p className="lead">
            Passeios com um dog walker de confiança. Seu melhor amigo gasta energia, explora o mundo
            com segurança e volta para casa tranquilo, no ritmo que combina com ele.
          </p>
          <div className="cta-row" style={{ display: "flex", gap: 16, marginTop: 30, flexWrap: "wrap" }}>
            <a className="btn btn-wa btn-lg" href={wa} target="_blank" rel="noopener">
              <WaIcon />
              Falar no WhatsApp
            </a>
            <a className="btn btn-white btn-lg" href="#como-funciona">
              Ver como funciona
            </a>
          </div>
        </div>
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          {/* TODO: substituir por foto real de passeio (aguardando envio) */}
          <img className="photo" src="/photos/passeios-hero.jpg" alt="Dog walker passeando com cães na rua — Patas & Passos" />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" id="beneficios">
        <div className="sec-head center reveal">
          <span className="eyebrow">Por que o passeio faz bem</span>
          <h2 className="h-lg">
            Mais saúde, <span className="hl">menos ansiedade</span>
          </h2>
          <p className="lead">
            Cães precisam se movimentar e farejar o mundo. O passeio diário cuida do corpo e da mente
            do seu melhor amigo — e ainda traz paz pra casa.
          </p>
        </div>
        <div className="cards c3">
          {[
            ["blue", "Energia gasta = casa em paz", "Um cão que passeou chega em casa tranquilo. Menos latido, menos destruição e mais sono gostoso pra todo mundo."],
            ["coral", "Menos ansiedade e tédio", "Ficar o dia todo em casa estressa. O passeio quebra a rotina, alivia a ansiedade e deixa o dog mais equilibrado."],
            ["green", "Saúde física em dia", "Movimento ajuda no peso, nas articulações e na digestão. Caminhar todo dia é cuidado de saúde, não só lazer."],
            ["amber", "Socialização e estímulo", "Novos cheiros, sons e ambientes estimulam a mente. Quando possível, encontros tranquilos com outros dogs e pessoas."],
            ["lilac", "Profissional de confiança", "Quem passeia conhece o jeitinho do seu dog, respeita o ritmo dele e cuida de cada detalhe na rua."],
            ["blue", "Flexível pra sua rotina", "Você escolhe os dias e horários. A gente busca e devolve em casa, com toda a segurança."],
          ].map(([color, t, p], i) => (
            <div className="card reveal" key={i}>
              <div className={`ico ico-${color}`}>
                <PawIco color={ICO[color as keyof typeof ICO]} />
              </div>
              <h3 className="h-md">{t}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="como-funciona">
        <div className="sec-head center reveal">
          <span className="eyebrow">Como funciona</span>
          <h2 className="h-lg">
            Simples pra você, <span className="hl">gostoso pra ele</span>
          </h2>
          <p className="lead">Do combinado ao reencontro, é tudo pensado pra ser fácil e seguro.</p>
        </div>
        <div className="steps" style={{ maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Combine pelo WhatsApp", "A gente entende a rotina, o porte e o jeitinho do seu dog e monta a agenda de passeios."],
            ["Buscamos em casa", "No dia e horário combinados, buscamos seu melhor amigo com todo o cuidado."],
            ["Passeio seguro", "Caminhada no ritmo dele, com guia e coleira adequadas e atenção total. Hidratação e segurança sempre."],
            ["Fotos e novidades", "Você recebe fotos e um resumo de como foi o passeio. Tranquilidade de quem acompanha de pertinho."],
            ["Volta pra casa feliz", "Seu dog retorna cansado do jeito bom — pronto pra relaxar ao seu lado."],
          ].map(([t, p], i) => (
            <div className="step reveal" key={i}>
              <div className="num">{i + 1}</div>
              <div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="depoimentos">
        <div className="sec-head center reveal">
          <span className="eyebrow">Quem confia, recomenda</span>
          <h2 className="h-lg">
            Tutores (e dogs) <span className="hl">apaixonados</span>
          </h2>
        </div>
        <div className="quotes">
          {[testimonials[0], testimonials[2], testimonials[5]].map((t, i) => (
            <div className="quote reveal" key={i}>
              <div className="stars">★★★★★</div>
              <p>&quot;{t.quote}&quot;</p>
              <div className="who">
                <div className="av">{t.initial}</div>
                <div>
                  <b>{t.name}</b>
                  <span>{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="cta-band reveal">
          <svg className="paw-bg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" fill="#fff" aria-hidden="true">
            <g opacity=".5">
              <ellipse cx="60" cy="150" rx="20" ry="16" />
              <ellipse cx="40" cy="125" rx="8" ry="11" />
              <ellipse cx="58" cy="116" rx="8" ry="11" />
              <ellipse cx="78" cy="120" rx="8" ry="11" />
            </g>
            <g opacity=".5">
              <ellipse cx="330" cy="60" rx="20" ry="16" />
              <ellipse cx="310" cy="35" rx="8" ry="11" />
              <ellipse cx="328" cy="26" rx="8" ry="11" />
              <ellipse cx="348" cy="30" rx="8" ry="11" />
            </g>
          </svg>
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2>Bora tirar esse dog pra passear? 🐾</h2>
            <p>Monte a agenda de passeios do seu melhor amigo pelo WhatsApp. É rapidinho.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            Agendar passeios
          </a>
        </div>
      </section>
    </div>
  );
}
