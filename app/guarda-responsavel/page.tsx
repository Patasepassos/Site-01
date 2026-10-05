import type { Metadata } from "next";
import Link from "next/link";
import { waLink, waMessages } from "@/lib/site";

export const metadata: Metadata = {
  title: "Por Que os Animais São Abandonados? Guarda Responsável · Patas & Passos",
  description:
    "Entenda as causas educacionais, psicológicas, sociais e legais por trás do abandono de animais no Brasil, e o que muda com planejamento e guarda responsável.",
  keywords: [
    "guarda responsável",
    "abandono de animais",
    "por que as pessoas abandonam cachorros",
    "maus-tratos a animais",
    "acúmulo de animais",
    "adoção responsável",
    "bem-estar animal",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Por Que os Animais São Abandonados? Guarda Responsável · Patas & Passos",
    description:
      "As causas educacionais, psicológicas, sociais e legais por trás do abandono de animais — e como a guarda responsável começa antes da adoção.",
    locale: "pt_BR",
    type: "website",
  },
};

const WaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16 4C9.9 4 5 8.9 5 15c0 2.1.6 4.1 1.7 5.8L5 27l6.4-1.7c1.6.9 3.5 1.4 5.4 1.4 6.1 0 11-4.9 11-11S22.1 4 16 4zm0 20c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.8 1 1-3.7-.2-.4C7 18.7 6.5 16.9 6.5 15 6.5 9.8 10.8 5.5 16 5.5S25.5 9.8 25.5 15 21.2 24 16 24zm5.3-6.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(163,108,67,.08)",
        borderLeft: "3px solid var(--blue-tile)",
        borderRadius: 12,
        padding: "16px 20px",
        margin: "20px 0",
        fontSize: 14.5,
        lineHeight: 1.65,
      }}
    >
      {children}
    </div>
  );
}

const checklist = [
  "Tempo real na rotina — não só hoje, mas daqui a 5, 10 ou 15 anos.",
  "Orçamento mensal e de emergência — alimentação, vacinas, exames, imprevistos de saúde.",
  "Espaço físico compatível com o porte e a energia do animal.",
  "Estilo de vida — viagens frequentes, mudanças previstas, trabalho com rotina instável.",
  "Rede de apoio — quem fica com o pet se você precisar se ausentar.",
  "Expectativa realista de comportamento — todo animal exige adaptação, treino e paciência.",
];

export default function GuardaResponsavelPage() {
  const wa = waLink(waMessages.default);
  return (
    <div className="wrap">
      <section className="phero" style={{ gridTemplateColumns: "1fr" }}>
        <div className="reveal in" style={{ position: "relative", zIndex: 2, maxWidth: 780 }}>
          <span className="eyebrow">🐾 Conteúdo educativo</span>
          <h1 className="h-xl">Por que os animais são abandonados — e o que muda com guarda responsável</h1>
          <p className="lead">
            O abandono de animais no Brasil raramente tem uma única explicação. Ele nasce do
            cruzamento entre fatores educacionais, psicológicos, sociais e também falhas de
            fiscalização — e entender essas camadas é o primeiro passo para preveni-lo, sem
            simplificações e sem julgamento de quem vive essa realidade de perto.
          </p>
        </div>
      </section>

      <article className="section" style={{ paddingTop: 0, maxWidth: 780, margin: "0 auto" }}>
        <h2 className="h-lg">Fatores educacionais e culturais</h2>

        <h3 className="h-md" style={{ marginTop: 18 }}>A lacuna de informação</h3>
        <p>
          Boa parte das adoções e compras por impulso acontece porque a decisão é tomada com
          informação incompleta. Um filhote pequeno não revela, de cara, o porte que vai alcançar,
          o nível de energia que vai ter ou os custos recorrentes de manutenção. Quando a família
          descobre essas informações só depois — já com o animal em casa —, o choque de realidade
          pode levar a decisões precipitadas, inclusive o abandono.
        </p>

        <h3 className="h-md" style={{ marginTop: 18 }}>A coisificação do animal</h3>
        <p>
          Outro fator cultural relevante é tratar o animal como objeto de desejo ou acessório —
          adquirido por modismo, pela estética de uma raça ou como presente de data comemorativa —
          em vez de reconhecê-lo como um ser senciente, com necessidades físicas e emocionais
          próprias. Quando o vínculo nasce da posse em vez do cuidado, ele tende a ser mais frágil
          diante da primeira dificuldade real.
        </p>

        <h2 className="h-lg" style={{ marginTop: 40 }}>Fatores psicológicos e sociais</h2>

        <h3 className="h-md" style={{ marginTop: 18 }}>A relação com a violência doméstica</h3>
        <p>
          Pesquisadores internacionais e nacionais estudam há décadas o que ficou conhecido como{" "}
          <b>Teoria do Elo</b> (&quot;The Link&quot;): a constatação, documentada pela primeira vez
          de forma sistemática pelos pesquisadores Phil Arkow e Frank Ascione, de que maus-tratos a
          animais e violência doméstica contra mulheres, crianças e idosos frequentemente coexistem
          no mesmo ambiente familiar. Isso não significa que todo caso de maus-tratos envolva
          violência doméstica — significa que, quando um profissional (veterinário, assistente
          social, educador) identifica maus-tratos a um animal, essa pode ser uma oportunidade
          importante de rastrear outras formas de violência no mesmo lar.
        </p>

        <h3 className="h-md" style={{ marginTop: 18 }}>Acúmulo de animais (hoarding)</h3>
        <p>
          A acumulação excessiva de animais é um padrão complexo, reconhecido pela literatura
          especializada como frequentemente associado a dificuldades de saúde mental — e não como
          um ato deliberado de crueldade. Pessoas que acumulam animais em geral acreditam
          genuinamente estar ajudando-os, mesmo quando, na prática, não conseguem mais prover
          condições mínimas de higiene, espaço ou atendimento veterinário para todos. Por isso, a
          resposta mais eficaz não é o julgamento moral, e sim a intervenção técnica — com apoio de
          saúde mental, assistência social e órgãos de proteção animal atuando em conjunto.
        </p>

        <Highlight>
          Não fazemos diagnóstico à distância sobre pessoas ou situações individuais. Os pontos
          acima descrevem padrões estudados pela literatura especializada em saúde pública e
          bem-estar animal — nunca um julgamento sobre casos específicos.
        </Highlight>

        <h3 className="h-md" style={{ marginTop: 18 }}>Vulnerabilidade social e dificuldade financeira</h3>
        <p>
          É essencial separar negligência deliberada de vulnerabilidade social. Muitas famílias em
          situação de dificuldade financeira amam profundamente seus animais e fazem sacrifícios
          reais para mantê-los — mas enfrentam barreiras concretas de acesso a castração, consultas
          veterinárias e insumos básicos. Tratar essas famílias como negligentes, sem considerar o
          contexto estrutural, é injusto e pouco produtivo. O caminho mais eficaz passa por ampliar
          o acesso a serviços populares de saúde animal, não por culpabilizar quem já enfrenta
          dificuldades.
        </p>

        <h2 className="h-lg" style={{ marginTop: 40 }}>Fiscalização, denúncia e responsabilização</h2>
        <p>
          Embora o Brasil tenha legislação específica contra maus-tratos a animais — o artigo 32 da
          Lei Federal nº 9.605/1998, com penas agravadas para cães e gatos pela Lei nº 14.064/2020
          —, a efetividade da fiscalização enfrenta obstáculos práticos: recursos limitados dos
          órgãos de proteção animal, dificuldade de produzir provas em ambientes privados e, em
          muitos casos, a sensação de impunidade que desestimula novas denúncias. Essa percepção,
          real ou não em cada caso específico, tem um efeito concreto: menos pessoas denunciam, e
          menos casos chegam a ser investigados.
        </p>
        <p>
          Romper esse ciclo depende, em parte, de cada denúncia feita pelos canais corretos — mesmo
          quando o resultado não é imediato. Detalhamos os canais oficiais de denúncia em São
          Paulo na página <Link href="/maus-tratos">Maus-Tratos e Como Denunciar</Link>.
        </p>

        <h2 className="h-lg" style={{ marginTop: 40 }}>A prevenção começa antes de levar um animal para casa</h2>
        <p>
          A guarda responsável não é um conceito abstrato — ela se traduz em perguntas concretas
          que vale a pena responder com honestidade antes da adoção ou da compra:
        </p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Nenhuma dessas perguntas tem resposta certa universal — mas respondê-las com antecedência
          evita que a decisão seja revista tarde demais, com o animal já integrado à família.
        </p>

        <h2 className="h-lg" style={{ marginTop: 40 }}>O papel coletivo da sociedade</h2>
        <p>
          Reduzir o abandono não depende só do tutor individual. Tutores podem planejar melhor e
          buscar apoio antes de desistir. Médicos-veterinários e a cadeia de serviços pet podem
          orientar com honestidade desde a primeira consulta. O setor pet pode evitar campanhas que
          estimulem a compra por impulso. Comunidades e vizinhos podem identificar e apoiar — em vez
          de isolar — famílias em dificuldade. E o poder público pode ampliar o acesso a castração e
          atendimento veterinário popular, fortalecendo a ponta mais estrutural do problema. Nenhum
          desses atores, sozinho, resolve a questão — mas juntos, formam uma rede de prevenção real.
        </p>

        <h2 className="h-lg" style={{ marginTop: 40 }}>Cuidar com consciência: o propósito da Patas &amp; Passos</h2>
        <p>
          A Patas &amp; Passos não é uma ONG de adoção, e não existe para resolver sozinha um
          problema tão multifatorial quanto o abandono. Existimos para um papel mais específico e
          igualmente importante: ajudar famílias que já têm um pet a sustentar, no dia a dia, o
          compromisso que assumiram. Passeios que gastam a energia acumulada, uma creche que cobre
          as horas em que a casa fica vazia, um pet sitter para uma viagem, hospedagem para uma
          mudança — cada um desses cuidados profissionais reduz uma das pressões reais que, somadas,
          podem levar uma família ao limite. Cuidado constante, rotina estruturada e socialização
          adequada não resolvem causas sociais profundas, mas fortalecem, um pet de cada vez, a
          capacidade de cada família de honrar o compromisso que fez.
        </p>
      </article>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="cta-band reveal">
          <div style={{ position: "relative", zIndex: 2 }}>
            <h2>Precisa de apoio pra sustentar a rotina do seu pet? 🐾</h2>
            <p>Conversa não tem custo nenhum — às vezes a solução é mais simples do que parece.</p>
          </div>
          <a className="btn btn-white btn-lg" style={{ position: "relative", zIndex: 2 }} href={wa} target="_blank" rel="noopener">
            <WaIcon /> Falar no WhatsApp
          </a>
        </div>
      </section>

      <section style={{ maxWidth: 780, margin: "32px auto 0" }}>
        <h3 className="h-md">Fontes e referências</h3>
        <ul style={{ fontSize: 12.5, color: "var(--ink-soft)", paddingLeft: 20, lineHeight: 1.8 }}>
          <li>
            Lei Federal nº 9.605/1998 e Lei nº 14.064/2020 —{" "}
            <a href="https://www.planalto.gov.br/ccivil_03/leis/l9605.htm" target="_blank" rel="noopener noreferrer">
              Portal da Legislação do Planalto
            </a>
          </li>
          <li>Conselho Federal de Medicina Veterinária (CFMV) — cfmv.gov.br</li>
          <li>
            Arkow, P. &amp; Ascione, F. — estudos fundadores da Teoria do Elo (&quot;The Link&quot;)
            entre maus-tratos a animais e violência doméstica
          </li>
          <li>Organização Mundial da Saúde (OMS) — diretrizes sobre saúde pública e bem-estar animal</li>
          <li>World Animal Protection — materiais sobre guarda responsável e bem-estar animal</li>
        </ul>
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 10 }}>
          Conteúdo educativo e informativo, produzido pela Patas &amp; Passos a partir de fontes
          públicas. Não substitui orientação de um médico-veterinário, psicólogo, assistente social
          ou advogado para casos individuais.
        </p>
      </section>
    </div>
  );
}
