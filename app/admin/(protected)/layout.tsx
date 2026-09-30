import { redirect } from "next/navigation";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import LogoutButton from "@/components/portal/LogoutButton";
import { AdminBottomNav, AdminDesktopNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaffUser();
  if (!staff) redirect("/admin/login");

  const firstName = staff.profile.full_name.split(" ")[0];

  const supabaseAdmin = createSupabaseAdminClient();
  const { count: pendingPartners } = await supabaseAdmin
    .from("partners")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <div className="portal-topbar-in">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".04em", opacity: 0.75, margin: 0 }}>
              🔐 PAINEL ADMINISTRATIVO
            </p>
            <h1>Olá, {firstName}</h1>
            <p>Patas &amp; Passos — gestão interna</p>
          </div>
          <LogoutButton label="Sair do painel" redirectTo="/admin/login" />
        </div>
        <AdminDesktopNav isAdmin={staff.profile.role === "admin"} pendingPartners={pendingPartners ?? 0} />
      </header>

      <div className="portal-content">{children}</div>

      <AdminBottomNav isAdmin={staff.profile.role === "admin"} pendingPartners={pendingPartners ?? 0} />
    </div>
  );
}
