import type { Metadata } from "next";
import { waLink, waMessages } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Pet Sitter em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Pet sitter em São Caetano do Sul e Santo André — SP: seu pet cuidado no conforto da própria casa, com a rotina de sempre, amor e segurança.",
  keywords: [
    "pet sitter São Caetano do Sul",
    "pet sitter Santo André",
    "cuidador de pet em casa",
    "babá de cachorro",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Pet Sitter em São Caetano do Sul e Santo André · Patas & Passos",
    description:
      "Seu pet cuidado no conforto da própria casa, com a rotina de sempre, amor e segurança.",
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

export default function PetSitterPage() {
  const wa = waLink(waMessages.petsitter);
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">🏡 Pet Sitter</span>
          <h1 className="h-xl">
            Cuidado no conforto da <span className="hl">própria casa</span>
          </h1>
          <p className="lead">
            Quando você precisa se ausentar, a gente vai até o seu pet. Ele fica no ambiente que
            conhece, com a rotina de sempre — sem o stress de mudar de lugar.
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
          <img className="photo photo-full" src="/photos/pet-sitter-hero.jpg" alt="Pet recebendo carinho e cuidado em casa durante o atendimento do pet sitter — Patas & Passos" />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" id="beneficios">
        <div className="sec-head center reveal">
          <span className="eyebrow">Por que o pet sitter faz bem</span>
          <h2 className="h-lg">
            A rotina dele, <span className="hl">sem mudanças</span>
          </h2>
          <p className="lead">
            Pets se sentem mais seguros no próprio território. O pet sitter mantém tudo no lugar
            enquanto você está fora.
          </p>
        </div>
        <div className="cards c3">
          {[
            ["blue", "Rotina mantida", "Mesma comida, mesmos horários, mesma caminha. O dia a dia segue como ele já conhece e gosta."],
            ["coral", "Sem stress de mudança", "Nada de ambiente novo, cheiros estranhos ou outros animais. Menos ansiedade pra pets mais sensíveis."],
            ["green", "Cuidado individual", "Atenção total pro seu pet, do jeitinho dele. Alimentação, água fresca, higiene e muito carinho."],
            ["amber", "Sua casa de olho", "De quebra, a casa não fica totalmente sozinha: luzes, plantas e aquela sensação de movimento."],
            ["lilac", "Ideal pra tímidos e idosos", "Perfeito pra pets que não se adaptam a hotel, filhotes, idosos ou quem precisa de medicação na hora certa."],
            ["blue", "Atualizações pra você", "Fotos e novidades a cada visita. Você viaja tranquilo sabendo que está tudo bem em casa."],
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
            Da conversa ao <span className="hl">seu retorno</span>
          </h2>
          <p className="lead">Um processo simples e transparente pra você se ausentar tranquilo.</p>
        </div>
        <div className="steps" style={{ maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Conversa pelo WhatsApp", "Conte a rotina, a alimentação, a medicação (se houver) e o jeitinho do seu pet. Combinamos as visitas."],
            ["A gente conhece o pet", "Um primeiro encontro pra criar vínculo e alinhar tudo: onde fica a ração, os brinquedos e os cantos favoritos."],
            ["Visitas com cuidado", "Nas datas combinadas, vamos até sua casa: alimentação, água, higiene, passeio (se fizer parte) e companhia."],
            ["Relatório a cada visita", "Você recebe fotos e um resumo de como foi. Acompanha tudo de onde estiver."],
            ["Reencontro tranquilo", "Você volta pra um pet calmo, bem cuidado e uma casa em ordem."],
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
          <span className="eyebrow">Quem confiou, indicou</span>
          <h2 className="h-lg">
            Tutores que viajaram <span className="hl">tranquilos</span>
          </h2>
        </div>
        <div className="quotes">
          {[testimonials[0], testimonials[4], testimonials[2]].map((t, i) => (
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
            <h2>Vai viajar? Deixe seu pet em casa, bem cuidado 🏡</h2>
            <p>Combine as visitas do pet sitter pelo WhatsApp e se ausente tranquilo.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            Contratar pet sitter
          </a>
        </div>
      </section>
    </div>
  );
}
