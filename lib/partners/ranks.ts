import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, RankTierRow } from "@/lib/supabase/types";
import { getActiveClientCount } from "./active-clients";

export type PartnerRankInfo = {
  activeClients: number;
  tiers: RankTierRow[];
  currentTier: RankTierRow | null;
  nextTier: RankTierRow | null;
  /** 0..1 — progresso dentro do intervalo até o próximo nível. null se já está no último nível. */
  progressToNext: number | null;
  remainingToNext: number | null;
};

/**
 * Calcula o Rank atual do parceiro a partir da mesma contagem real de
 * "clientes ativos" usada pelo motor de comissão. Os níveis (rank_tiers) são
 * 100% configuráveis pelo admin em /admin/ranks — nunca hardcoded aqui.
 *
 * IMPORTANTE: isto é só a camada de exibição/gamificação. O valor REAL de
 * comissão paga continua vindo inteiramente de commission_rules via
 * lib/partners/commission-engine.ts — esta função nunca grava nada e nunca
 * é usada pra calcular pagamento.
 */
export async function getPartnerRankInfo(
  supabase: SupabaseClient<Database>,
  partnerId: string
): Promise<PartnerRankInfo> {
  const [activeClients, tiersResult] = await Promise.all([
    getActiveClientCount(supabase, partnerId),
    supabase.from("rank_tiers").select("*").eq("active", true).order("sort_order", { ascending: true }),
  ]);
  if (tiersResult.error) throw tiersResult.error;

  const tiers = tiersResult.data ?? [];

  let currentTier: RankTierRow | null = null;
  for (const tier of tiers) {
    if (activeClients >= tier.min_clients) currentTier = tier;
  }

  const currentIndex = currentTier ? tiers.findIndex((t) => t.id === currentTier!.id) : -1;
  const nextTier = tiers[currentIndex + 1] ?? null;

  let progressToNext: number | null = null;
  let remainingToNext: number | null = null;
  if (nextTier) {
    const base = currentTier?.min_clients ?? 0;
    const span = nextTier.min_clients - base;
    progressToNext = span > 0 ? Math.min(1, Math.max(0, (activeClients - base) / span)) : 1;
    remainingToNext = Math.max(0, nextTier.min_clients - activeClients);
  }

  return { activeClients, tiers, currentTier, nextTier, progressToNext, remainingToNext };
}
