import { redirect } from "next/navigation";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatBRL } from "@/lib/partners/labels";

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function AdminDashboardPage() {
  const staff = await requireStaffUser();
  if (!staff) redirect("/parceiros/login");

  const supabaseAdmin = createSupabaseAdminClient();
  const monthStart = startOfMonthIso();

  const [
    { count: partnersAtivos },
    { count: indicacoesAbertas },
    { data: vendasMes },
    { data: comissoesPendentes },
    { data: comissoesPagasMes },
    { data: saquesPendentes },
  ] = await Promise.all([
    supabaseAdmin.from("partners").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin
      .from("customers")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(fechado,cancelado,nao_convertido)")
      .is("archived_at", null),
    supabaseAdmin.from("sales").select("amount").gte("created_at", monthStart),
    supabaseAdmin.from("commissions").select("amount").eq("status", "bloqueada"),
    supabaseAdmin.from("commissions").select("amount").eq("status", "paga").gte("created_at", monthStart),
    supabaseAdmin.from("payouts").select("amount").in("status", ["solicitado", "em_analise", "aprovado"]),
  ]);

  const sum = (rows: { amount: number }[] | null) => (rows ?? []).reduce((total, r) => total + Number(r.amount), 0);

  const cards = [
    { label: "🐾 Parceiros ativos", num: String(partnersAtivos ?? 0) },
    { label: "📋 Indicações abertas", num: String(indicacoesAbertas ?? 0) },
    { label: "💵 Vendas do mês", num: formatBRL(sum(vendasMes)), sub: `${vendasMes?.length ?? 0} vendas` },
    {
      label: "🟣 Comissões pendentes",
      num: formatBRL(sum(comissoesPendentes)),
      sub: `${comissoesPendentes?.length ?? 0} comissões`,
    },
    {
      label: "💰 Comissões pagas (mês)",
      num: formatBRL(sum(comissoesPagasMes)),
      sub: `${comissoesPagasMes?.length ?? 0} comissões`,
    },
    {
      label: "💸 Saques pendentes",
      num: formatBRL(sum(saquesPendentes)),
      sub: `${saquesPendentes?.length ?? 0} saques`,
    },
  ];

  return (
    <>
      <div className="portal-card">
        <h2>Visão geral</h2>
        <p>Olá, {staff.profile.full_name.split(" ")[0]} — aqui está o resumo da operação hoje.</p>
      </div>

      <div className="portal-stat-grid">
        {cards.map((card) => (
          <div className="portal-stat" key={card.label}>
            <span className="label">{card.label}</span>
            <span className="num">{card.num}</span>
            {card.sub && <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{card.sub}</span>}
          </div>
        ))}
      </div>
    </>
  );
}
