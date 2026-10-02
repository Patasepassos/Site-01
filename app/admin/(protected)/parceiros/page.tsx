import Link from "next/link";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthEmailMap } from "@/lib/admin/auth-emails";
import { PARTNER_STATUS_LABELS, daysSince, formatDate } from "@/lib/partners/labels";
import PartnerStatusActions from "@/components/admin/PartnerStatusActions";
import TestFlagToggle from "@/components/admin/TestFlagToggle";
import RemovePartnerButton from "@/components/admin/RemovePartnerButton";
import type { PartnerStatus } from "@/lib/supabase/types";

const TABS: { key: PartnerStatus | "all"; label: string }[] = [
  { key: "pending", label: "Aguardando aprovação" },
  { key: "active", label: "Ativos" },
  { key: "blocked", label: "Bloqueados" },
  { key: "all", label: "Todos" },
];

const INACTIVITY_LIMIT_DAYS = 365;

export default async function AdminParceirosPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const staff = await requireStaffUser();
  const isOwner = staff?.profile.is_owner ?? false;
  const activeTab = (searchParams.status ?? "pending") as PartnerStatus | "all";
  const supabaseAdmin = createSupabaseAdminClient();

  let query = supabaseAdmin.from("partners").select("*").order("created_at", { ascending: false });
  if (activeTab !== "all") query = query.eq("status", activeTab);
  const { data: partners } = await query;

  const profileIds = (partners ?? []).map((p) => p.profile_id);
  const partnerIds = (partners ?? []).map((p) => p.id);
  const [{ data: profiles }, emailMap, { data: recentCustomers }] = await Promise.all([
    profileIds.length
      ? supabaseAdmin.from("profiles").select("*").in("id", profileIds)
      : Promise.resolve({ data: [] }),
    getAuthEmailMap(supabaseAdmin, profileIds),
    partnerIds.length
      ? supabaseAdmin
          .from("customers")
          .select("partner_id, created_at")
          .in("partner_id", partnerIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  // Primeira ocorrência de cada partner_id já é a mais recente, por causa do
  // order acima -- evita um round-trip extra por parceiro só pra isso.
  const lastActivityByPartnerId = new Map<string, string>();
  for (const c of recentCustomers ?? []) {
    if (!lastActivityByPartnerId.has(c.partner_id)) lastActivityByPartnerId.set(c.partner_id, c.created_at);
  }

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
            const lastActivityAt = lastActivityByPartnerId.get(partner.id) ?? partner.created_at;
            const inactiveDays = daysSince(lastActivityAt);
            const isInactive = !partner.account_deleted_at && inactiveDays >= INACTIVITY_LIMIT_DAYS;
            return (
              <div className="referral-row" key={partner.id}>
                <div>
                  <div className="rr-id">
                    <Link href={`/admin/parceiros/${partner.id}`}>{profile?.full_name ?? "—"}</Link>
                    {partner.is_test && <span className="admin-badge-test">TESTE</span>}
                    {isInactive && <span className="admin-badge-test" style={{ background: "#C0392B" }}>⚠️ {inactiveDays}d SEM INDICAR</span>}
                  </div>
                  <div className="rr-meta">
                    {emailMap.get(partner.profile_id) ?? "e-mail indisponível"} · cupom{" "}
                    {partner.coupon_code} · desde {formatDate(partner.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span className={`status-pill ${partner.status}`}>{PARTNER_STATUS_LABELS[partner.status]}</span>
                  <div className="admin-actions">
                    {!partner.account_deleted_at && <PartnerStatusActions partnerId={partner.id} status={partner.status} />}
                    <TestFlagToggle kind="parceiros" id={partner.id} isTest={partner.is_test} />
                    {isOwner && !partner.account_deleted_at && <RemovePartnerButton partnerId={partner.id} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
