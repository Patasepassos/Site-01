import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type PartnerProgress = {
  progress: number;
  goal: number;
  locked: boolean;
  remaining: number;
  message: string;
  /** Só existe quando locked = false. Nunca inclua isso numa resposta enquanto locked = true. */
  unlockedAmount?: number;
};

/**
 * Calcula o progresso e o status de bloqueio do parceiro inteiramente no
 * servidor. O valor da comissão só entra no objeto de retorno depois que a
 * meta é atingida — nunca antes disso, mesmo que o chamador peça.
 */
export async function getPartnerProgress(
  supabase: SupabaseClient<Database>,
  partnerId: string
): Promise<PartnerProgress> {
  const { data: rule, error: ruleError } = await supabase
    .from("commission_rules")
    .select("*")
    .eq("rule_type", "meta_clientes")
    .eq("active", true)
    .is("service", null)
    .order("min_clients", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (ruleError) throw ruleError;

  // Sem regra ativa configurada: nada pode ser liberado ainda.
  if (!rule) {
    return {
      progress: 0,
      goal: 0,
      locked: true,
      remaining: 0,
      message: "Nenhuma regra de comissão ativa no momento.",
    };
  }

  const { count, error: countError } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("status", "fechado");

  if (countError) throw countError;

  const closedCount = count ?? 0;
  const goal = rule.min_clients;
  const locked = closedCount < goal;

  if (locked) {
    const remaining = goal - closedCount;
    return {
      progress: closedCount,
      goal,
      locked: true,
      remaining,
      message:
        remaining === 1
          ? "Falta apenas 1 cliente!"
          : `Faltam ${remaining} clientes para liberar sua comissão.`,
    };
  }

  const { data: commissions, error: commissionsError } = await supabase
    .from("commissions")
    .select("amount")
    .eq("partner_id", partnerId)
    .in("status", ["liberada", "paga"]);

  if (commissionsError) throw commissionsError;

  const unlockedAmount = (commissions ?? []).reduce((sum, c) => sum + Number(c.amount), 0);

  return {
    progress: closedCount,
    goal,
    locked: false,
    remaining: 0,
    message: "Meta concluída! Sua comissão foi liberada.",
    unlockedAmount,
  };
}
