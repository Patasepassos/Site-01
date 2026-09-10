import type { Metadata } from "next";
import { waLink, waMessages } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Creche para Cães em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Creche (day care) para cães em São Caetano do Sul e Santo André — SP: o dia todo com brincadeira, socialização e supervisão, no ritmo dele.",
  keywords: [
    "creche para cães São Caetano do Sul",
    "day care canino Santo André",
    "creche canina SP",
    "day care para cachorro",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Creche para Cães · Patas & Passos",
    description:
      "O dia todo com brincadeira, socialização e supervisão em São Caetano do Sul e Santo André.",
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

export default function CrechePage() {
  const wa = waLink(waMessages.creche);
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="page-hero-blob" />
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">🧸 Creche · Day Care</span>
          <h1 className="h-xl">
            O dia todo com <span className="hl">brincadeira e amigos</span>
          </h1>
          <p className="lead">
            Enquanto você trabalha ou resolve a vida, seu pet passa o dia rodeado de estímulo,
            companhia e supervisão. Chega em casa cansado do jeito bom — cheio de histórias pra contar.
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
          <img className="photo" src="/photos/creche-hero.jpg" alt="Cães brincando juntos na creche da Patas & Passos" />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" id="beneficios">
        <div className="sec-head center reveal">
          <span className="eyebrow">Por que a creche faz bem</span>
          <h2 className="h-lg">
            Estímulo, amigos e <span className="hl">rotina saudável</span>
          </h2>
          <p className="lead">
            Um dia cheio de atividade em grupo é diversão garantida — e menos ansiedade, tédio e
            solidão pra quem fica sozinho em casa.
          </p>
        </div>
        <div className="cards c3">
          {[
            ["blue", "Nunca sozinho", "Seu pet passa o dia acompanhado, sem o stress e a ansiedade de ficar sozinho em casa por horas."],
            ["coral", "Muita energia gasta", "Brincadeira o dia inteiro com outros cães cansa do jeito bom — chega em casa tranquilo pra descansar."],
            ["green", "Socialização constante", "Convívio diário com outros cães desenvolve comportamento social e ajuda no equilíbrio emocional."],
            ["amber", "Supervisão o tempo todo", "Equipe presente durante toda a estadia, atenta ao comportamento e ao bem-estar de cada dog."],
            ["lilac", "Rotina no horário certo", "Alimentação, descanso e brincadeira sempre nos mesmos horários, do jeito que faz bem pra ele."],
            ["blue", "Flexível pra sua semana", "Leve e busque nos dias que precisar — diária avulsa ou pacote fixo, você escolhe."],
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
            Deixa com a gente, <span className="hl">busca feliz</span>
          </h2>
          <p className="lead">Do check-in ao reencontro, um dia tranquilo pra vocês dois.</p>
        </div>
        <div className="steps" style={{ maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Combine pelo WhatsApp", "A gente entende a rotina, o jeitinho e o nível de sociabilidade do seu dog antes do primeiro dia."],
            ["Deixe pela manhã", "Você traz seu pet no horário combinado, com toda a tranquilidade de saber que ele está em boas mãos."],
            ["Dia cheio de atividade", "Brincadeira supervisionada com outros cães, descanso e muito carinho, do jeito certo pra ele."],
            ["Fotos e novidades", "Você recebe fotos e atualizações do dia, acompanhando de pertinho mesmo estando longe."],
            ["Busca no fim do dia", "Seu melhor amigo volta pra casa cansado, feliz e pronto pra uma boa noite de sono."],
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

      {/* GALLERY */}
      <section className="section" id="galeria">
        <div className="sec-head center reveal">
          <span className="eyebrow">Um dia na creche</span>
          <h2 className="h-lg">Muita <span className="hl">brincadeira e amizade</span></h2>
        </div>
        <div className="gallery reveal">
          <img className="photo span2" src="/photos/creche-play-1.jpg" alt="Cães brincando juntos na creche" />
          <img className="photo" src="/photos/creche-play-2.jpg" alt="Cães interagindo na creche" />
          <img className="photo" src="/photos/creche-play-3.jpg" alt="Hora da brincadeira na creche" />
        </div>
      </section>

      {/* VIDEO REAL */}
      <section className="section" id="video">
        <div className="cards c2" style={{ alignItems: "center", gap: 40 }}>
          <div className="video-card reveal">
            <video
              src="/videos/creche-dia.mp4"
              poster="/videos/creche-dia-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Cães brincando e interagindo durante um dia na creche da Patas & Passos"
            />
            <p className="video-caption">Um dia de verdade na nossa creche</p>
          </div>
          <div className="reveal">
            <span className="eyebrow">Direto da nossa creche</span>
            <h2 className="h-lg">
              Cada dia é <span className="hl">brincadeira, amizade e movimento</span>
            </h2>
            <p className="lead">
              Nada de vídeo posado: esse é um dia real de creche, com os cães à vontade,
              interagindo entre eles e se divertindo sob supervisão o tempo todo.
            </p>
          </div>
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
          {[testimonials[1], testimonials[2], testimonials[5]].map((t, i) => (
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
            <h2>Bora matricular ele na creche? 🧸</h2>
            <p>Combine os dias da semana pelo WhatsApp. É rapidinho.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            Agendar creche
          </a>
        </div>
      </section>
    </div>
  );
}
