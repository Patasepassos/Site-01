import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Maus-Tratos a Animais: o que é e como denunciar em São Paulo · Patas & Passos",
  description:
    "O que a lei brasileira considera maus-tratos a animais e os canais oficiais para denunciar em São Paulo: Polícia Militar, Disque-Denúncia e Delegacia Eletrônica.",
  openGraph: {
    title: "Maus-Tratos a Animais: o que é e como denunciar · Patas & Passos",
    description: "Informação educativa com base em fontes oficiais sobre maus-tratos a animais e canais de denúncia em São Paulo.",
    locale: "pt_BR",
    type: "website",
  },
};

const tiposMausTratos = [
  "Abandono em via pública, terrenos ou outros locais",
  "Agressão física, espancamento ou mutilação",
  "Privação de água ou alimentação adequada",
  "Falta de abrigo contra sol, chuva ou frio extremo",
  "Confinamento inadequado (correntes curtas, espaços sem higiene ou ventilação)",
  "Falta de atendimento veterinário quando o animal precisa",
  "Envenenamento intencional",
];

const canais = [
  { nome: "Emergência / flagrante", contato: "190", desc: "Polícia Militar — quando a violência está acontecendo ou há risco imediato ao animal." },
  { nome: "Disque-Denúncia (SP)", contato: "181", desc: "Canal estadual para denúncias em geral, incluindo maus-tratos a animais." },
  { nome: "Disque Denúncia Animal (SP)", contato: "0800 600 6428", desc: "Linha específica do estado de São Paulo, com atendimento de equipes acompanhadas por veterinários." },
  { nome: "Delegacia Eletrônica de Proteção Animal", contato: "depa.ssp.sp.gov.br", desc: "Registro de denúncia pela internet, com sigilo dos dados pessoais e protocolo para acompanhar o caso." },
  { nome: "IBAMA", contato: "0800 61 8080", desc: "Para casos envolvendo animais silvestres." },
];

export default function MausTratosPage() {
  return (
    <div className="wrap">
      <section className="phero" style={{ gridTemplateColumns: "1fr" }}>
        <div className="reveal in" style={{ position: "relative", zIndex: 2, maxWidth: 760 }}>
          <span className="eyebrow">🐾 Conteúdo educativo</span>
          <h1 className="h-xl">
            Maus-tratos a animais: <span className="hl">o que diz a lei e como denunciar</span>
          </h1>
          <p className="lead">
            Proteção animal não é só uma questão de bom senso — é lei no Brasil. Reunimos aqui, de
            forma clara e com base em fontes oficiais, o que caracteriza maus-tratos e os canais
            corretos pra denunciar em São Paulo.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="sec-head center reveal">
          <span className="eyebrow">O que a lei considera maus-tratos</span>
          <h2 className="h-lg">
            Vai muito além da <span className="hl">agressão física</span>
          </h2>
        </div>
        <div className="cards c3">
          {tiposMausTratos.map((t) => (
            <div className="card reveal" key={t}>
              <p style={{ margin: 0 }}>{t}</p>
            </div>
          ))}
        </div>
        <div style={{ maxWidth: 760, margin: "32px auto 0" }}>
          <p className="lead" style={{ fontSize: 15 }}>
            No Brasil, maus-tratos a animais são crime previsto no <b>artigo 32 da Lei Federal nº
            9.605/1998</b> (Lei de Crimes Ambientais), com pena de detenção de três meses a um ano,
            além de multa. Desde a <b>Lei nº 14.064/2020</b> — conhecida como Lei Sansão —, quando a
            vítima é um cão ou um gato, a pena sobe para <b>reclusão de dois a cinco anos</b>, multa
            e proibição de guarda do animal. Se o maus-tratos resultar em morte, a pena ainda pode
            ser aumentada de um sexto a um terço.
          </p>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 10 }}>
            Informação jurídica de caráter geral e educativo, não substitui orientação de um
            advogado. Leis podem ser alteradas — confirme sempre o texto vigente em fontes
            oficiais, como o{" "}
            <a href="https://www.planalto.gov.br/ccivil_03/leis/l9605.htm" target="_blank" rel="noopener noreferrer">
              Portal da Legislação do Planalto
            </a>
            .
          </p>
        </div>
      </section>

      <section className="section">
        <div className="sec-head center reveal">
          <span className="eyebrow">Como denunciar em São Paulo</span>
          <h2 className="h-lg">
            Denuncie — <span className="hl">o silêncio não protege ninguém</span>
          </h2>
          <p className="lead" style={{ maxWidth: 700, margin: "0 auto" }}>
            Ao denunciar, reúna o máximo de informação possível: endereço exato, data e horário,
            fotos ou vídeos (sem invadir propriedade alheia) e, se houver, dados de testemunhas.
          </p>
        </div>
        <div className="cards c3">
          {canais.map((c) => (
            <div className="card reveal" key={c.nome}>
              <h3 className="h-md">{c.nome}</h3>
              <p style={{ fontWeight: 700, color: "var(--blue-deep)", margin: "4px 0" }}>{c.contato}</p>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", textAlign: "center", maxWidth: 700, margin: "24px auto 0" }}>
          Números e canais de atendimento podem mudar. Confirme sempre a informação mais atual
          junto à Secretaria de Segurança Pública do Estado de São Paulo antes de denunciar.
        </p>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="cta-band reveal">
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2>Quer saber mais sobre cuidado responsável? 🐾</h2>
            <p>Também preparamos um conteúdo sobre guarda responsável e como evitar o abandono.</p>
          </div>
          <Link className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href="/guarda-responsavel">
            Ver guarda responsável
          </Link>
        </div>
      </section>
    </div>
  );
}
