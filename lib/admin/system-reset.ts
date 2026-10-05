import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { logAudit } from "@/lib/partners/audit";

export type SystemCounts = {
  partners: number;
  customers: number;
  sales: number;
  commissions: number;
  payouts: number;
  realPaidPayouts: number;
  testRecords: number;
};

export async function getSystemCounts(supabaseAdmin: SupabaseClient<Database>): Promise<SystemCounts> {
  const [
    { count: partners },
    { count: customers },
    { count: sales },
    { count: commissions },
    { count: payouts },
    { data: paidPayouts },
    { count: testPartners },
    { count: testCustomers },
  ] = await Promise.all([
    supabaseAdmin.from("partners").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("customers").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("sales").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("commissions").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("payouts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("payouts").select("partner_id").eq("status", "pago"),
    supabaseAdmin.from("partners").select("id", { count: "exact", head: true }).eq("is_test", true),
    supabaseAdmin.from("customers").select("id", { count: "exact", head: true }).eq("is_test", true),
  ]);

  const paidPartnerIds = Array.from(new Set((paidPayouts ?? []).map((p) => p.partner_id)));
  const { data: paidPartners } = paidPartnerIds.length
    ? await supabaseAdmin.from("partners").select("id, is_test").in("id", paidPartnerIds)
    : { data: [] };
  const testPartnerIdSet = new Set((paidPartners ?? []).filter((p) => p.is_test).map((p) => p.id));
  const realPaidPayouts = (paidPayouts ?? []).filter((p) => !testPartnerIdSet.has(p.partner_id)).length;

  return {
    partners: partners ?? 0,
    customers: customers ?? 0,
    sales: sales ?? 0,
    commissions: commissions ?? 0,
    payouts: payouts ?? 0,
    realPaidPayouts,
    testRecords: (testPartners ?? 0) + (testCustomers ?? 0),
  };
}

export class RealPaymentsExistError extends Error {
  counts: SystemCounts;
  constructor(counts: SystemCounts) {
    super("Existem pagamentos reais registrados neste sistema.");
    this.counts = counts;
  }
}

/**
 * Apaga TODOS os parceiros, indicações, vendas, comissões, saques e
 * notificações — mantém commission_rules (configuração de negócio) e
 * audit_logs (a própria ação de zerar fica registrada ali antes de apagar
 * qualquer coisa). Nunca apaga a conta do admin. Se existir pagamento real
 * já confirmado, só executa com confirmRealPayments = true.
 */
export async function wipeSystem(
  supabaseAdmin: SupabaseClient<Database>,
  adminId: string,
  opts: { confirmRealPayments: boolean }
): Promise<SystemCounts> {
  const counts = await getSystemCounts(supabaseAdmin);

  if (counts.realPaidPayouts > 0 && !opts.confirmRealPayments) {
    throw new RealPaymentsExistError(counts);
  }

  await logAudit(supabaseAdmin, {
    actorId: adminId,
    actorRole: "admin",
    action: "system_wiped",
    entityType: "system",
    metadata: counts,
  });

  const { data: allPayouts } = await supabaseAdmin.from("payouts").select("proof_path");
  const proofPaths = (allPayouts ?? []).map((p) => p.proof_path).filter((p): p is string => Boolean(p));
  if (proofPaths.length > 0) {
    await supabaseAdmin.storage.from("comprovantes").remove(proofPaths);
  }

  await supabaseAdmin.from("commissions").delete().not("id", "is", null);
  await supabaseAdmin.from("sales").delete().not("id", "is", null);
  await supabaseAdmin.from("customers").delete().not("id", "is", null);
  await supabaseAdmin.from("payouts").delete().not("id", "is", null);
  await supabaseAdmin.from("partner_notifications").delete().not("id", "is", null);

  const { data: partnerProfiles } = await supabaseAdmin.from("partners").select("profile_id");
  await supabaseAdmin.from("partners").delete().not("id", "is", null);

  const profileIds = (partnerProfiles ?? []).map((p) => p.profile_id);
  if (profileIds.length > 0) {
    await supabaseAdmin.from("profiles").delete().in("id", profileIds);
    for (const profileId of profileIds) {
      await supabaseAdmin.auth.admin.deleteUser(profileId);
    }
  }

  return counts;
}
