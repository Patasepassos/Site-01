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

function periodOf(iso: string): string {
  return iso.slice(0, 7); // "2026-09"
}

/**
 * Recalcula as comissões de um parceiro a partir das regras ativas. Chamada
 * sempre que uma venda é registrada (cliente fechado) pelo admin. Nunca
 * roda no cliente — só em rotas de servidor com a service_role key.
 *
 * Para cada regra ativa: encontra os clientes fechados elegíveis (pelo
 * serviço da regra, e pela recorrência quando rule.recurring), gera uma
 * comissão por venda ligada a esses clientes (se ainda não existir) e, se a
 * meta de clientes da regra já foi atingida, libera todas as comissões
 * daquela regra de uma vez — nunca uma a uma, para respeitar a mecânica de
 * "bateu a meta, libera tudo".
 */
export async function recalculatePartnerCommissions(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string
): Promise<void> {
  const { data: rules, error: rulesError } = await supabaseAdmin
    .from("commission_rules")
    .select("*")
    .eq("active", true);
  if (rulesError) throw rulesError;

  for (const rule of rules ?? []) {
    let customersQuery = supabaseAdmin
      .from("customers")
      .select("id, service")
      .eq("partner_id", partnerId)
      .eq("status", "fechado");
    if (rule.service) customersQuery = customersQuery.eq("service", rule.service);

    const { data: closedCustomers, error: customersError } = await customersQuery;
    if (customersError) throw customersError;

    const customerIds = (closedCustomers ?? []).map((c) => c.id);
    if (customerIds.length === 0) continue;

    const { data: sales, error: salesError } = await supabaseAdmin
      .from("sales")
      .select("*")
      .in("customer_id", customerIds);
    if (salesError) throw salesError;

    let qualifyingCustomerIds = customerIds;
    if (rule.recurring) {
      const recurringCustomerIds = new Set(
        (sales ?? []).filter((s) => s.contract_type !== "avulso").map((s) => s.customer_id)
      );
      qualifyingCustomerIds = customerIds.filter((id) => recurringCustomerIds.has(id));
    }

    const unlocked = qualifyingCustomerIds.length >= rule.min_clients;
    const qualifyingSales = (sales ?? []).filter((s) => qualifyingCustomerIds.includes(s.customer_id));
    if (qualifyingSales.length === 0) continue;

    const { data: existingCommissions, error: existingError } = await supabaseAdmin
      .from("commissions")
      .select("*")
      .eq("partner_id", partnerId)
      .eq("rule_id", rule.id);
    if (existingError) throw existingError;

    const existingBySaleId = new Map((existingCommissions ?? []).map((c) => [c.sale_id, c]));
    const nowIso = new Date().toISOString();

    for (const sale of qualifyingSales) {
      const existing = existingBySaleId.get(sale.id);
      if (existing) continue;

      const amount = Math.round(Number(sale.amount) * (Number(rule.percentage) / 100) * 100) / 100;
      const { error: insertError } = await supabaseAdmin.from("commissions").insert({
        partner_id: partnerId,
        rule_id: rule.id,
        sale_id: sale.id,
        period: periodOf(sale.created_at),
        amount,
        status: unlocked ? "liberada" : "bloqueada",
        unlocked_at: unlocked ? nowIso : null,
      });
      if (insertError) throw insertError;
    }

    if (unlocked) {
      const { error: unlockError } = await supabaseAdmin
        .from("commissions")
        .update({ status: "liberada", unlocked_at: nowIso })
        .eq("partner_id", partnerId)
        .eq("rule_id", rule.id)
        .eq("status", "bloqueada");
      if (unlockError) throw unlockError;
    }
  }
}

/**
 * Ao marcar um saque como pago, promove comissões 'liberada' -> 'paga' (as
 * mais antigas primeiro) até cobrir o valor do saque. Isso garante que o
 * saldo disponível (liberada - saques ativos) não volte a contar o valor já
 * pago como disponível de novo.
 */
export async function markCommissionsAsPaid(
  supabaseAdmin: SupabaseClient<Database>,
  partnerId: string,
  amount: number
): Promise<void> {
  const { data: liberadas, error } = await supabaseAdmin
    .from("commissions")
    .select("*")
    .eq("partner_id", partnerId)
    .eq("status", "liberada")
    .order("created_at", { ascending: true });
  if (error) throw error;

  let remaining = amount;
  const idsToMarkPaid: string[] = [];
  for (const commission of liberadas ?? []) {
    if (remaining <= 0) break;
    idsToMarkPaid.push(commission.id);
    remaining -= Number(commission.amount);
  }
  if (idsToMarkPaid.length === 0) return;

  const { error: updateError } = await supabaseAdmin
    .from("commissions")
    .update({ status: "paga" })
    .in("id", idsToMarkPaid);
  if (updateError) throw updateError;
}
