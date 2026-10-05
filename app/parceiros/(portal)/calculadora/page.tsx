import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import CommissionCalculator from "@/components/portal/CommissionCalculator";

export default async function CalculadoraPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  const supabaseAdmin = createSupabaseAdminClient();
  // Só os campos que o próprio afiliado já pode ver em /parceiros/regras --
  // nunca custo, margem ou faturamento da empresa, que não existem nessa
  // tabela de qualquer forma (ela só guarda a REMUNERAÇÃO do afiliado).
  const { data: rules } = await supabaseAdmin
    .from("commission_rules")
    .select("id, name, service, rule_type, percentage, min_clients, recurring")
    .eq("active", true)
    .order("service", { ascending: true, nullsFirst: true });

  return (
    <div className="portal-card">
      <h2>🧮 Calculadora de comissão</h2>
      <p style={{ marginBottom: 14 }}>
        Veja uma estimativa de quanto você pode receber por uma venda, com base nas regras de
        comissão vigentes. É só uma prévia — o valor final segue sempre a regra ativa no momento do
        fechamento.
      </p>
      <CommissionCalculator rules={rules ?? []} />
    </div>
  );
}
