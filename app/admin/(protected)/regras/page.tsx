import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import NewRuleForm from "@/components/admin/NewRuleForm";
import RuleRow from "@/components/admin/RuleRow";

export default async function AdminRegrasPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/parceiros");

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: rules } = await supabaseAdmin
    .from("commission_rules")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <>
      <div className="portal-card">
        <h2>Regras da parceria</h2>
        <p style={{ marginBottom: 4 }}>
          Percentual e mínimo de clientes são sempre configuráveis aqui — nunca fixos no código.
        </p>
        <div style={{ marginTop: 14 }}>
          {!rules || rules.length === 0 ? (
            <p>Nenhuma regra cadastrada.</p>
          ) : (
            rules.map((rule) => <RuleRow key={rule.id} rule={rule} />)
          )}
        </div>
      </div>

      <div className="portal-card">
        <h2>Nova regra</h2>
        <NewRuleForm />
      </div>
    </>
  );
}
