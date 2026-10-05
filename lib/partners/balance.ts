import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export type PartnerBalance = {
  disponivel: number;
  pendente: number;
  recebido: number;
};

function sum(values: { amount: number }[] | null): number {
  return (values ?? []).reduce((total, v) => total + Number(v.amount), 0);
}

/** Sempre recalculado a partir do banco — nunca aceite esse valor vindo do cliente. */
export async function getPartnerBalance(
  supabase: SupabaseClient<Database>,
  partnerId: string
): Promise<PartnerBalance> {
  const [{ data: liberadas }, { data: pagas }, { data: payoutsAtivos }] = await Promise.all([
    supabase.from("commissions").select("amount").eq("partner_id", partnerId).eq("status", "liberada"),
    supabase.from("commissions").select("amount").eq("partner_id", partnerId).eq("status", "paga"),
    supabase
      .from("payouts")
      .select("amount")
      .eq("partner_id", partnerId)
      .in("status", ["solicitado", "em_analise", "aprovado"]),
  ]);

  const totalLiberado = sum(liberadas);
  const pendente = sum(payoutsAtivos);

  return {
    disponivel: Math.max(totalLiberado - pendente, 0),
    pendente,
    recebido: sum(pagas),
  };
}
