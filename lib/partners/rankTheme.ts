import type { RankKey } from "@/lib/supabase/types";

/**
 * Cor de "LED" fixa por nível de Rank (não vem do banco, de propósito —
 * identidade visual de marca por nível, igual pedido: Filhote=ferrugem,
 * Companheiro=bronze, Lion de Ouro=ouro, Tigre Platina=platina, Wolf Lenda
 * Plus=arco-íris). Usada em RankGrid (vitrine) e no anel ao redor da foto de
 * perfil/avatar, pra mostrar o nível atual em qualquer lugar que mostre o
 * ícone do parceiro.
 */
export const RANK_THEME: Record<RankKey, { c1: string; c2: string; glow: string; rainbow?: boolean }> = {
  filhote: { c1: "#d1602a", c2: "#8c3b12", glow: "rgba(209,96,42,.6)" },
  companheiro: { c1: "#cd7f32", c2: "#f4a261", glow: "rgba(205,127,50,.6)" },
  lion_ouro: { c1: "#ffd700", c2: "#ffa500", glow: "rgba(255,215,0,.65)" },
  tigre_platina: { c1: "#e5e4e2", c2: "#a8dede", glow: "rgba(168,222,222,.6)" },
  wolf_lenda: { c1: "#ff3b3b", c2: "#8b5cf6", glow: "rgba(167,139,250,.65)", rainbow: true },
};
