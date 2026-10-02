import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * "Cliente ativo" = indicação fechada com venda de pagamento CONFIRMADO.
 * Única fonte dessa contagem -- usada tanto pelo motor de comissão
 * (commission-engine.ts) quanto pelo sistema de Rank (ranks.ts), pra nunca
 * divergir entre os dois.
 */
export async function getActiveClientCount(
  supabase: SupabaseClient<Database>,
  partnerId: string
): Promise<number> {
  const { data: closedCustomers, error: closedError } = await supabase
    .from("customers")
    .select("id")
    .eq("partner_id", partnerId)
    .eq("status", "fechado");
  if (closedError) throw closedError;

  const closedIds = (closedCustomers ?? []).map((c) => c.id);
  if (closedIds.length === 0) return 0;

  const { data: confirmedSales, error: confirmedError } = await supabase
    .from("sales")
    .select("customer_id")
    .in("customer_id", closedIds)
    .eq("payment_status", "confirmado");
  if (confirmedError) throw confirmedError;

  return new Set((confirmedSales ?? []).map((s) => s.customer_id)).size;
}
