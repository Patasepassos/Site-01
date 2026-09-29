import Link from "next/link";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthEmailMap } from "@/lib/admin/auth-emails";
import { PARTNER_STATUS_LABELS, formatDate } from "@/lib/partners/labels";
import PartnerStatusActions from "@/components/admin/PartnerStatusActions";
import type { PartnerStatus } from "@/lib/supabase/types";

const TABS: { key: PartnerStatus | "all"; label: string }[] = [
  { key: "pending", label: "Aguardando aprovação" },
  { key: "active", label: "Ativos" },
  { key: "blocked", label: "Bloqueados" },
  { key: "all", label: "Todos" },
];

export default async function AdminParceirosPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const activeTab = (searchParams.status ?? "pending") as PartnerStatus | "all";
  const supabaseAdmin = createSupabaseAdminClient();

  let query = supabaseAdmin.from("partners").select("*").order("created_at", { ascending: false });
  if (activeTab !== "all") query = query.eq("status", activeTab);
  const { data: partners } = await query;

  const profileIds = (partners ?? []).map((p) => p.profile_id);
  const [{ data: profiles }, emailMap] = await Promise.all([
    profileIds.length
      ? supabaseAdmin.from("profiles").select("*").in("id", profileIds)
      : Promise.resolve({ data: [] }),
    getAuthEmailMap(supabaseAdmin, profileIds),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="portal-card">
      <h2>Parceiros</h2>
      <div className="admin-tabs">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/parceiros?status=${tab.key}`}
            className={`admin-tab${activeTab === tab.key ? " active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        {!partners || partners.length === 0 ? (
          <p>Nenhum parceiro nessa categoria.</p>
        ) : (
          partners.map((partner) => {
            const profile = profileById.get(partner.profile_id);
            return (
              <div className="referral-row" key={partner.id}>
                <div>
                  <div className="rr-id">
                    <Link href={`/admin/parceiros/${partner.id}`}>{profile?.full_name ?? "—"}</Link>
                  </div>
                  <div className="rr-meta">
                    {emailMap.get(partner.profile_id) ?? "e-mail indisponível"} · cupom{" "}
                    {partner.coupon_code} · desde {formatDate(partner.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className={`status-pill ${partner.status}`}>{PARTNER_STATUS_LABELS[partner.status]}</span>
                  <PartnerStatusActions partnerId={partner.id} status={partner.status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
