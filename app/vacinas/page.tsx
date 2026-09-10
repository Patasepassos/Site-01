import type { Metadata } from "next";
import { waLink, waMessages } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Vacinas a Domicílio em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Vacinação a domicílio para pets em São Caetano do Sul e Santo André — SP: sem stress de deslocamento, no conforto de casa e no seu horário.",
  keywords: [
    "vacina a domicílio São Caetano do Sul",
    "vacinação de cachorro Santo André",
    "veterinário a domicílio SP",
    "vacina para pet em casa",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Vacinas a Domicílio · Patas & Passos",
    description:
      "Vacinação a domicílio para pets em São Caetano do Sul e Santo André, sem stress de deslocamento.",
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

export default function VacinasPage() {
  const wa = waLink(waMessages.vacinas);
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="page-hero-blob" />
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">💉 Vacinas a domicílio</span>
          <h1 className="h-xl">
            Vacinação sem stress, no <span className="hl">conforto de casa</span>
          </h1>
          <p className="lead">
            A gente vai até você. Seu pet é vacinado no ambiente que conhece, sem a tensão da sala de
            espera nem o risco de contato com animais doentes. Tudo com responsabilidade e segurança.
          </p>
          <div className="cta-row" style={{ display: "flex", gap: 16, marginTop: 30, flexWrap: "wrap" }}>
            <a className="btn btn-wa btn-lg" href={wa} target="_blank" rel="noopener">
              <WaIcon />
              Agendar pelo WhatsApp
            </a>
            <a className="btn btn-white btn-lg" href="#como-funciona">
              Ver como funciona
            </a>
          </div>
        </div>
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <video
            className="photo"
            src="/videos/vacina-aplicacao.mp4"
            poster="/videos/vacina-aplicacao-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-label="Aplicação de vacina em cachorro, feita em casa pela Patas & Passos"
          />
        </div>
      </section>

      {/* A DOMICÍLIO */}
      <section className="section" id="a-domicilio">
        <div className="cards c2" style={{ alignItems: "center", gap: 40 }}>
          <div className="video-card reveal">
            <video
              src="/videos/vacina-preparo.mp4"
              poster="/videos/vacina-preparo-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Material de vacinação preparado e higienizado antes do atendimento"
            />
            <p className="video-caption">Material higienizado e preparado antes de cada visita</p>
          </div>
          <div className="reveal">
            <span className="eyebrow">100% a domicílio</span>
            <h2 className="h-lg">
              A vacina é aplicada <span className="hl">na sua casa</span>, do início ao fim
            </h2>
            <p className="lead">
              Nada de deslocamento até uma clínica: a gente leva até você todo o material já
              higienizado e preparado, e a vacina é aplicada ali, no ambiente que o seu pet já
              conhece — com você por perto, do jeito mais tranquilo possível pra ele.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" id="beneficios">
        <div className="sec-head center reveal">
          <span className="eyebrow">Por que vacinar em casa</span>
          <h2 className="h-lg">
            Mais conforto, <span className="hl">menos risco</span>
          </h2>
          <p className="lead">
            A vacinação em casa protege a saúde do seu pet e poupa o estresse do deslocamento — pra
            você e pra ele.
          </p>
        </div>
        <div className="cards c3">
          {[
            ["blue", "Sem stress de deslocamento", "Nada de carro, transporte e sala de espera. Seu pet fica calmo no ambiente que já conhece."],
            ["coral", "Menos risco de contágio", "Evita o contato com animais doentes que circulam em clínicas — importante pra filhotes e idosos."],
            ["green", "Aplicação responsável", "Vacinas armazenadas e aplicadas com os cuidados certos, respeitando o protocolo de cada idade e porte."],
            ["amber", "Carteirinha em dia", "A gente registra tudo e te orienta sobre as próximas doses e reforços, pra não perder data."],
            ["lilac", "No seu horário", "Agende no dia e horário que cabem na sua rotina, sem fila e sem espera."],
            ["blue", "Orientação de verdade", "Tire dúvidas sobre o esquema vacinal e os cuidados do seu pet com quem entende e tem paciência."],
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
            Simples, rápido e <span className="hl">seguro</span>
          </h2>
          <p className="lead">Do agendamento ao registro, tudo no conforto da sua casa.</p>
        </div>
        <div className="steps" style={{ maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Agende pelo WhatsApp", "Conte a idade, o porte e o histórico do seu pet. A gente orienta sobre as vacinas indicadas e marca a visita."],
            ["A gente vai até você", "No dia e horário combinados, chegamos com tudo o que é preciso, com calma e sem pressa."],
            ["Aplicação tranquila", "Avaliação rápida e aplicação com manejo cuidadoso, respeitando o tempo e o conforto do seu pet."],
            ["Registro e orientação", "Atualizamos a carteirinha e deixamos as próximas datas anotadas, com todas as orientações de cuidado."],
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
          <span className="eyebrow">Aprovado pelos tutores</span>
          <h2 className="h-lg">
            Cuidado que <span className="hl">tranquiliza</span>
          </h2>
        </div>
        <div className="quotes">
          {[testimonials[0], testimonials[4], testimonials[3]].map((t, i) => (
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
            <h2>Vacinação em dia, sem sair de casa 💉</h2>
            <p>Agende a visita pelo WhatsApp e mantenha a saúde do seu pet protegida.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            Agendar vacinação
          </a>
        </div>
      </section>
    </div>
  );
}
