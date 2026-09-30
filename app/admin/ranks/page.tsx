import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import RankTierRow from "@/components/admin/RankTierRow";

export default async function AdminRanksPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/parceiros");

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: tiers } = await supabaseAdmin.from("rank_tiers").select("*").order("sort_order", { ascending: true });

  return (
    <div className="portal-card">
      <h2>Níveis do programa (Rank)</h2>
      <p style={{ marginBottom: 4 }}>
        Meta de clientes ativos e percentuais são sempre configuráveis aqui — nunca fixos no código. Isto é a
        vitrine motivacional mostrada ao parceiro; o cálculo real de comissão continua em{" "}
        <a href="/admin/regras">Regras</a>.
      </p>
      <div style={{ marginTop: 14 }}>
        {!tiers || tiers.length === 0 ? <p>Nenhum nível cadastrado.</p> : tiers.map((tier) => <RankTierRow key={tier.id} tier={tier} />)}
      </div>
    </div>
  );
}
