import type { Metadata } from "next";
import { waLink, waMessages } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Socialização e Passeios em Grupo em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Passeios em grupo para cães em São Caetano do Sul e Santo André — SP: grupos pequenos e supervisionados para seu pet fazer amigos, se exercitar e se desenvolver com segurança.",
  keywords: [
    "socialização canina São Caetano do Sul",
    "passeio em grupo para cães",
    "socialização de cães Santo André",
    "grupo de passeio dog",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Socialização e Passeios em Grupo · Patas & Passos",
    description:
      "Grupos pequenos e supervisionados em São Caetano do Sul e Santo André para seu pet fazer amigos com segurança.",
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

export default function SocializacaoPage() {
  const wa = waLink(waMessages.socializacao);
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="page-hero-blob" />
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">🐕 Socialização · Passeios em Grupo</span>
          <h1 className="h-xl">
            Novos amigos, <span className="hl">mais equilíbrio</span>
          </h1>
          <p className="lead">
            Passeios em grupo cuidadosamente planejados para promover a socialização do seu pet com
            outros cães, de forma segura e supervisionada. Grupos pequenos, muito estímulo e ainda
            mais alegria.
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
          <img className="photo" src="/photos/creche-play-2.jpg" alt="Cães se socializando em passeio em grupo — Patas & Passos" />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section" id="beneficios">
        <div className="sec-head center reveal">
          <span className="eyebrow">Por que o grupo faz diferença</span>
          <h2 className="h-lg">
            Mais do que passear, <span className="hl">aprender a conviver</span>
          </h2>
          <p className="lead">
            A socialização é essencial para o desenvolvimento emocional e comportamental do seu pet.
            Em grupo, os benefícios se multiplicam.
          </p>
        </div>
        <div className="cards c3">
          {[
            ["blue", "Grupos pequenos", "Turmas de no máximo 4 cães para garantir atenção, segurança e interação de qualidade."],
            ["coral", "Avaliação prévia", "Cada pet passa por uma avaliação comportamental antes de entrar no grupo — segurança em primeiro lugar."],
            ["green", "Parques e áreas verdes", "Passeios em espaços abertos e seguros, com muito estímulo sensorial e novos ambientes para explorar."],
            ["amber", "Menos ansiedade social", "Pets que se socializam regularmente ficam mais calmos, confiantes e receptivos com outros animais e pessoas."],
            ["lilac", "Horários flexíveis", "Escolha os dias e horários que cabem na sua rotina. A gente organiza o grupo de forma compatível."],
            ["blue", "Profissional presente", "Supervisão constante do responsável durante todo o passeio. Você recebe fotos e um resumo ao final."],
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
            Simples pra você, <span className="hl">incrível pra ele</span>
          </h2>
          <p className="lead">Do primeiro contato ao passeio, tudo pensado para ser fácil e seguro.</p>
        </div>
        <div className="steps" style={{ maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Conversa pelo WhatsApp", "Conte o porte, o temperamento e a experiência do seu pet com outros cães. A gente indica o grupo ideal."],
            ["Avaliação comportamental", "Um encontro de apresentação para entender o jeitinho do seu pet e garantir que o grupo seja compatível."],
            ["Entrada no grupo", "Nas datas combinadas, buscamos seu pet e ele vai para o passeio já com a turma dele."],
            ["Passeio supervisionado", "Caminhada em parques ou áreas verdes, com atenção total a cada cão durante toda a atividade."],
            ["Volta e relatório", "Seu pet retorna feliz e cansado do jeito bom. Você recebe fotos e um resumo de como foi a interação."],
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
          <span className="eyebrow">Quem experimenta, aprova</span>
          <h2 className="h-lg">
            Pets mais <span className="hl">equilibrados</span>
          </h2>
        </div>
        <div className="quotes">
          {[testimonials[1], testimonials[4], testimonials[3]].map((t, i) => (
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
            <h2>Seu pet merece ter uma turma! 🐕</h2>
            <p>Monte o grupo pelo WhatsApp e deixe seu melhor amigo fazer novos amigos com segurança.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            Entrar no grupo
          </a>
        </div>
      </section>
    </div>
  );
}
