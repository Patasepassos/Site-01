import type { RankKey } from "@/lib/supabase/types";

/**
 * Frase de significado por nível de Rank -- usada na tela de evolução
 * (RankUpIntro), tanto no cadastro (Filhote) quanto numa subida de nível
 * real (RankUpWatcher). Cada frase explica o PORQUÊ daquele nome/emblema --
 * nunca é descrição de sistema ("você atingiu X clientes", isso fica só em
 * RankGrid) -- e conecta a imagem escolhida a um propósito que gera orgulho
 * em usar aquele selo. `headline` é a frase de impacto (negrito, grande);
 * `body` é o parágrafo curto que explica o significado por trás do nome e
 * do emblema. Ajuste o texto aqui livremente conforme os próximos ranks
 * forem ganhando identidade visual própria -- a estrutura (objeto indexado
 * por RankKey) já está pronta pra isso.
 */
export const RANK_FLAVOR: Record<RankKey, { headline: string; body: string }> = {
  filhote: {
    headline: "Por que “Filhote”? Porque todo grande cão começou exatamente assim.",
    body: "Esse emblema carrega a pureza do começo: curiosidade, energia e a coragem de dar o primeiro passo. Usar o Filhote não é estar no início — é provar, com orgulho, que a sua jornada já começou de verdade.",
  },
  companheiro: {
    headline: "“Companheiro” é o nome de quem já provou que fica.",
    body: "Esse elo representa lealdade conquistada na prática — o cão que caminha ao seu lado, não na frente nem atrás. Carregar esse emblema é mostrar que você não é só mais um nome na lista: é presença e confiança construídas.",
  },
  lion_ouro: {
    headline: "Um leão dourado porque liderança também se enxerga de longe.",
    body: "O ouro não é só cor — é reconhecimento. Esse emblema marca quem deixou de seguir o grupo pra começar a guiá-lo, com o brilho de quem conquistou o próprio território.",
  },
  tigre_platina: {
    headline: "Platina porque chegar aqui exige precisão, não sorte.",
    body: "O tigre caça sozinho, com inteligência e timing perfeitos — exatamente como quem alcança esse nível. Platina é o metal mais raro e resistente: esse emblema prova que você também é.",
  },
  wolf_lenda: {
    headline: "Lenda não é um título que se pede — é um que se conquista.",
    body: "O lobo lendário não lidera uma matilha: ele inspira várias. Esse é o emblema de quem deixou de competir pelo topo e passou a ser a referência que todo mundo tenta alcançar.",
  },
};
