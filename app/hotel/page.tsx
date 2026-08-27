import type { Metadata } from "next";
import { waLink, waMessages } from "@/lib/site";
import { testimonials } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Hotel para Cães em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Hotel para cães em São Caetano do Sul e Santo André — SP: hospedagem com conforto, rotina e companhia. Receba fotos do seu dog durante toda a estadia.",
  keywords: [
    "hotel para cães São Caetano do Sul",
    "hospedagem pet Santo André",
    "hotel para pets SP",
    "hospedagem de cachorro",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Hotel para Cães · Patas & Passos",
    description:
      "Hospedagem com conforto, rotina e companhia em São Caetano do Sul e Santo André.",
    locale: "pt_BR",
    type: "website",
  },
};

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

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16 4C9.9 4 5 8.9 5 15c0 2.1.6 4.1 1.7 5.8L5 27l6.4-1.7c1.6.9 3.5 1.4 5.4 1.4 6.1 0 11-4.9 11-11S22.1 4 16 4zm0 20c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.8 1 1-3.7-.2-.4C7 18.7 6.5 16.9 6.5 15 6.5 9.8 10.8 5.5 16 5.5S25.5 9.8 25.5 15 21.2 24 16 24zm5.3-6.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

const ICO = { blue: "#71402F", green: "#7A8A54", amber: "#F5C13D", coral: "#A36C43", lilac: "#B99A7B" };

export default function HotelPage() {
  const wa = waLink(waMessages.hotel);
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="page-hero-blob" />
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">🏠 Hotel para cães</span>
          <h1 className="h-xl">
            Viaje tranquilo. Ele fica em <span className="hl">boas patas</span>
          </h1>
          <p className="lead">
            Hospedagem com a sensação de casa: rotina, conforto e companhia o tempo todo. Seu melhor
            amigo dorme em paz e você recebe notícias dele.
          </p>
          <div className="cta-row" style={{ display: "flex", gap: 16, marginTop: 30, flexWrap: "wrap" }}>
            <a className="btn btn-wa btn-lg" href={wa} target="_blank" rel="noopener">
              <WaIcon />
              Reservar pelo WhatsApp
            </a>
            <a className="btn btn-white btn-lg" href="#estrutura">
              Ver a estrutura
            </a>
          </div>
        </div>
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <img className="photo" src="/photos/hotel-hero.jpg" alt="Dog descansando confortável no hotel da Patas & Passos" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="como-funciona">
        <div className="sec-head center reveal">
          <span className="eyebrow">Como funciona a hospedagem</span>
          <h2 className="h-lg">
            Da reserva ao reencontro, <span className="hl">sem stress</span>
          </h2>
          <p className="lead">
            Um processo simples e transparente pra você deixar seu dog com a gente e viajar leve.
          </p>
        </div>
        <div className="steps" style={{ maxWidth: 820, margin: "0 auto" }}>
          {[
            ["Conversa & reserva", "A gente entende a rotina, a alimentação e o jeitinho do seu dog. Você reserva as diárias pelo WhatsApp."],
            ["Check-in tranquilo", "Chegada acolhedora e sem pressa. Traga a caminha, o brinquedo e a ração de casa pra manter o conforto e o cheiro de sempre."],
            ["Dias cheios de companhia", "Rotina parecida com a de casa: passeios, brincadeira, alimentação no horário e muito carinho. Nunca sozinho."],
            ["Notícias pra você", "Enviamos fotos e atualizações durante a estadia. Você acompanha cada dia tranquilo, de onde estiver."],
            ["Reencontro feliz", "No check-out, seu melhor amigo volta saudável, bem cuidado e com aquela festa gostosa de quem foi muito bem tratado."],
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

      {/* STRUCTURE */}
      <section className="section" id="estrutura">
        <div className="sec-head center reveal">
          <span className="eyebrow">Estrutura & acomodações</span>
          <h2 className="h-lg">Um espaço confortável de verdade</h2>
        </div>
        <div className="cards c3" style={{ marginBottom: 28 }}>
          {[
            ["blue", "Ambiente climatizado", "Espaços arejados e na temperatura ideal, pensados pro descanso seguro em qualquer estação do ano."],
            ["green", "Área pra gastar energia", "Espaço para passeios e brincadeiras supervisionadas todos os dias — corpo ativo, mente tranquila."],
            ["amber", "Rotina no horário", "Alimentação, passeios e descanso sempre nos mesmos horários, mantendo o relógio biológico do seu dog em paz."],
            ["coral", "Cuidado individual", "Cada hóspede tem seu espaço de descanso. Cães se hospedam respeitando o porte, a energia e a personalidade."],
            ["lilac", "Olho atento o tempo todo", "Equipe presente e monitoramento durante o dia. Qualquer mudança no comportamento é percebida na hora."],
            ["blue", "Ambiente seguro e cercado", "Espaços limpos, cercados e monitorados, pensados pra evitar fugas e manter cada hóspede protegido."],
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
        <div className="gallery reveal">
          <img className="photo span2" src="/photos/hotel-rest-1.jpg" alt="Área de descanso do hotel" />
          <img className="photo" src="/photos/hotel-rest-2.jpg" alt="Dog em passeio" />
          <img className="photo" src="/photos/hotel-gallery-real-1.jpg" alt="Hóspedes brincando na sala do hotel" />
          <img className="photo" src="/photos/hotel-rest-3.jpg" alt="Soneca gostosa" />
          <img className="photo" src="/photos/hotel-gallery-real-2.jpg" alt="Dog descansando com seu brinquedo na caminha" />
        </div>
      </section>

      {/* VIDEO REAL */}
      <section className="section" id="video">
        <div className="cards c2" style={{ alignItems: "center", gap: 40 }}>
          <div className="video-card reveal">
            <video
              src="/videos/hotel-dia.mp4"
              poster="/videos/hotel-dia-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Hóspede do Hotel Pet passeando, brincando e se alimentando durante a estadia — Patas & Passos"
            />
            <p className="video-caption">Um dia de hóspede no nosso Hotel Pet</p>
          </div>
          <div className="reveal">
            <span className="eyebrow">Direto do nosso hotel</span>
            <h2 className="h-lg">
              Passeio, estímulo e <span className="hl">muito carinho</span>, todos os dias
            </h2>
            <p className="lead">
              Cada hóspede tem sua rotina de passeios, brincadeiras e alimentação no horário
              certo — este é um vídeo real de um dia de estadia, sem cenas posadas.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section" id="depoimentos">
        <div className="sec-head center reveal">
          <span className="eyebrow">Tutores que viajaram tranquilos</span>
          <h2 className="h-lg">
            Histórias de quem <span className="hl">confiou</span>
          </h2>
        </div>
        <div className="quotes">
          {[testimonials[0], testimonials[1], testimonials[5]].map((t, i) => (
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
            <h2>Vai viajar? Garanta o lugar dele 🧳</h2>
            <p>Consulte disponibilidade de diárias e tire suas dúvidas com a gente pelo WhatsApp.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            Reservar hospedagem
          </a>
        </div>
      </section>
    </div>
  );
}
