import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { getPartnerProgress } from "@/lib/partners/commission-engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CommissionCalculator from "@/components/portal/CommissionCalculator";

export default async function CalculadoraPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabase = createSupabaseServerClient();
  const progress = await getPartnerProgress(supabase, current.partner.id);

  let percentage: number | null = null;
  if (!progress.locked) {
    const { data: rule } = await supabase
      .from("commission_rules")
      .select("percentage")
      .eq("rule_type", "meta_clientes")
      .eq("active", true)
      .is("service", null)
      .order("min_clients", { ascending: true })
      .limit(1)
      .maybeSingle();
    percentage = rule?.percentage ?? null;
  }

  return (
    <div className="portal-card">
      <h2>Calculadora</h2>

      {progress.locked || percentage === null ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div className="lock-icon">🔒</div>
          <p>Sua comissão ainda está bloqueada.</p>
          <p style={{ fontSize: 13 }}>
            Complete {progress.goal} clientes válidos para visualizar o valor liberado.
          </p>
        </div>
      ) : (
        <CommissionCalculator percentage={percentage} />
      )}
    </div>
  );
}
