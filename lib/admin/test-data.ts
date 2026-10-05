import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { logAudit } from "@/lib/partners/audit";

export type TestDataCounts = {
  partners: number;
  customers: number;
};

/**
 * Um cliente marcado como teste (customers.is_test) OU pertencente a um
 * parceiro marcado como teste (partners.is_test) conta como dado de teste —
 * um parceiro falso inteiro é teste mesmo que ninguém tenha marcado cada
 * cliente individualmente dele.
 */
async function collectTestScope(supabaseAdmin: SupabaseClient<Database>) {
  const [{ data: testPartners }, { data: directTestCustomers }] = await Promise.all([
    supabaseAdmin.from("partners").select("id, profile_id").eq("is_test", true),
    supabaseAdmin.from("customers").select("id, partner_id").eq("is_test", true),
  ]);

  const testPartnerIds = (testPartners ?? []).map((p) => p.id);

  const { data: customersUnderTestPartners } = testPartnerIds.length
    ? await supabaseAdmin.from("customers").select("id").in("partner_id", testPartnerIds)
    : { data: [] };

  const customerIds = new Set<string>([
    ...(directTestCustomers ?? []).map((c) => c.id),
    ...(customersUnderTestPartners ?? []).map((c) => c.id),
  ]);

  return { testPartners: testPartners ?? [], testPartnerIds, customerIds: Array.from(customerIds) };
}

export async function getTestDataCounts(supabaseAdmin: SupabaseClient<Database>): Promise<TestDataCounts> {
  const { testPartnerIds, customerIds } = await collectTestScope(supabaseAdmin);
  return { partners: testPartnerIds.length, customers: customerIds.length };
}

/**
 * Remove tudo marcado como teste: comissões e vendas dos clientes de teste
 * primeiro (senão a FK de commissions -> sales trava a exclusão), depois os
 * clientes, depois os parceiros de teste inteiros — perfil, saques,
 * notificações e o próprio usuário de autenticação. Nunca toca em parceiros
 * ou clientes que não estejam marcados como teste.
 */
export async function removeTestData(
  supabaseAdmin: SupabaseClient<Database>,
  adminId: string
): Promise<TestDataCounts> {
  const { testPartners, testPartnerIds, customerIds } = await collectTestScope(supabaseAdmin);

  if (customerIds.length > 0) {
    await supabaseAdmin.from("commissions").delete().in("customer_id", customerIds);
    await supabaseAdmin.from("sales").delete().in("customer_id", customerIds);
  }
  if (testPartnerIds.length > 0) {
    await supabaseAdmin.from("commissions").delete().in("partner_id", testPartnerIds);
  }

  if (customerIds.length > 0) {
    await supabaseAdmin.from("customers").delete().in("id", customerIds);
  }

  if (testPartnerIds.length > 0) {
    const { data: testPayouts } = await supabaseAdmin
      .from("payouts")
      .select("proof_path")
      .in("partner_id", testPartnerIds);
    const proofPaths = (testPayouts ?? []).map((p) => p.proof_path).filter((p): p is string => Boolean(p));
    if (proofPaths.length > 0) {
      await supabaseAdmin.storage.from("comprovantes").remove(proofPaths);
    }

    await supabaseAdmin.from("payouts").delete().in("partner_id", testPartnerIds);
    await supabaseAdmin.from("partner_notifications").delete().in("partner_id", testPartnerIds);
    await supabaseAdmin.from("partners").delete().in("id", testPartnerIds);

    const profileIds = testPartners.map((p) => p.profile_id);
    if (profileIds.length > 0) {
      await supabaseAdmin.from("profiles").delete().in("id", profileIds);
    }
    for (const profileId of profileIds) {
      await supabaseAdmin.auth.admin.deleteUser(profileId);
    }
  }

  await logAudit(supabaseAdmin, {
    actorId: adminId,
    actorRole: "admin",
    action: "test_data_removed",
    entityType: "system",
    metadata: { partnersRemoved: testPartnerIds.length, customersRemoved: customerIds.length },
  });

  return { partners: testPartnerIds.length, customers: customerIds.length };
}
