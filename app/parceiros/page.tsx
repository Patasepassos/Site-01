import type { Metadata } from "next";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Parceiros em São Caetano do Sul e Santo André · Patas & Passos",
  description:
    "Conheça os parceiros da Patas & Passos: pet shops, clínicas veterinárias e marcas que compartilham o amor pelos animais em São Caetano do Sul e Santo André — SP.",
  keywords: [
    "parceiros pet São Caetano do Sul",
    "pet shop Santo André",
    "clínica veterinária parceira",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Parceiros · Patas & Passos",
    description:
      "Pet shops, clínicas veterinárias e marcas parceiras em São Caetano do Sul e Santo André.",
    locale: "pt_BR",
    type: "website",
  },
};

const waPartner = waLink(
  "Olá! 🐾 Vim pelo site da Patas & Passos e gostaria de me tornar um parceiro. Podemos conversar?"
);

const PARTNERS = [
  {
    logo: "/parceiros/prestipet.png",
    name: "Presti Pet",
    category: "Pet Shop",
    desc: "Pet shop completo com rações, acessórios, produtos de higiene e muito carinho para o seu melhor amigo.",
    color: "blue",
    link: "https://www.prestipet.com.br/",
  },
  {
    logo: "/parceiros/dogshower.png",
    name: "Pet Shop Dog Shower",
    category: "Banho & Tosa",
    desc: "Banho e tosa profissional com atendimento cuidadoso e produtos de qualidade para deixar seu pet sempre lindo.",
    color: "coral",
    link: "https://www.instagram.com/petshopdogshower",
  },
];

const ICO: Record<string, string> = {
  blue: "#71402F",
  green: "#7A8A54",
  amber: "#F5C13D",
  coral: "#A36C43",
  lilac: "#B99A7B",
};

export default function ParceirosPage() {
  return (
    <div className="wrap">
      {/* HERO */}
      <section className="phero">
        <div className="page-hero-blob" />
        <div className="reveal in" style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow">🤝 Parceiros</span>
          <h1 className="h-xl">
            Quem cuida junto, cuida <span className="hl">melhor</span>
          </h1>
          <p className="lead">
            Parceiros que a Patas &amp; Passos confia e recomenda. Todos compartilham o mesmo
            compromisso: oferecer o melhor cuidado para os animais da nossa região.
          </p>
          <div className="cta-row" style={{ display: "flex", gap: 16, marginTop: 30, flexWrap: "wrap" }}>
            <a className="btn btn-wa btn-lg" href={waPartner} target="_blank" rel="noopener">
              Quero ser parceiro
            </a>
            <a className="btn btn-white btn-lg" href="#parceiros">
              Ver parceiros
            </a>
          </div>
        </div>
        <div className="reveal in" style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{
            width: "clamp(200px, 28vw, 380px)",
            aspectRatio: "1",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--cream) 0%, var(--sand) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "clamp(80px, 12vw, 140px)",
            boxShadow: "0 24px 64px rgba(61,31,21,.15)",
          }}>
            🤝
          </div>
        </div>
      </section>

      {/* PARTNERS GRID */}
      <section className="section" id="parceiros">
        <div className="sec-head center reveal">
          <span className="eyebrow">Quem faz parte da rede</span>
          <h2 className="h-lg">
            Parceiros que <span className="hl">recomendamos</span>
          </h2>
          <p className="lead">
            Empresas e profissionais selecionados por compartilharem os nossos valores de cuidado,
            respeito e amor pelos animais.
          </p>
        </div>
        <div className="cards c2" style={{ maxWidth: 860, margin: "0 auto" }}>
          {PARTNERS.map((p, i) => (
            <a className="card reveal partner-card" href={p.link} target="_blank" rel="noopener" key={i}
              style={{ textDecoration: "none", color: "inherit" }}>
              <div className="partner-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.logo} alt={p.name} />
              </div>
              <span className="eyebrow" style={{ marginBottom: 4 }}>{p.category}</span>
              <h3 className="h-md">{p.name}</h3>
              <p>{p.desc}</p>
              <span style={{ fontSize: 13, color: "var(--brown)", fontWeight: 600, marginTop: 8, display: "block" }}>
                Visitar →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* BECOME A PARTNER */}
      <section className="section" id="seja-parceiro">
        <div className="sec-head center reveal">
          <span className="eyebrow">Faça parte da rede</span>
          <h2 className="h-lg">
            Seja um <span className="hl">parceiro</span>
          </h2>
          <p className="lead">
            Tem um pet shop, clínica, escola de adestramento ou qualquer negócio voltado ao cuidado
            animal? Vamos conversar sobre como crescer juntos.
          </p>
        </div>
        <div className="cards c3" style={{ maxWidth: 860, margin: "0 auto" }}>
          {[
            ["🎯", "Indicação mútua", "Indicamos os nossos tutores para você e você indica os seus clientes para a gente. Todo mundo ganha."],
            ["📣", "Visibilidade", "Seu negócio aparece no nosso site e nas nossas redes. Alcance diretamente quem já cuida do pet."],
            ["🤝", "Confiança", "Ser parceiro Patas & Passos é um selo de qualidade e cuidado reconhecido pelos tutores da região."],
          ].map(([e, t, d], i) => (
            <div className="card reveal" key={i}>
              <div className="ico ico-green" style={{ fontSize: 28 }}>{e}</div>
              <h3 className="h-md">{t}</h3>
              <p>{d}</p>
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
            <h2>Vamos construir algo juntos? 🤝</h2>
            <p>Entre em contato pelo WhatsApp e descubra como se tornar um parceiro oficial da Patas &amp; Passos.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={waPartner} target="_blank" rel="noopener">
            Quero ser parceiro
          </a>
        </div>
      </section>
    </div>
  );
}
