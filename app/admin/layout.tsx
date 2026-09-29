import { redirect } from "next/navigation";
import { requireStaffUser } from "@/lib/admin/guard";
import LogoutButton from "@/components/portal/LogoutButton";
import { AdminBottomNav, AdminDesktopNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaffUser();
  if (!staff) redirect("/parceiros/login");

  const firstName = staff.profile.full_name.split(" ")[0];

  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <div className="portal-topbar-in">
          <div>
            <h1>Painel Admin 🐾</h1>
            <p>Olá, {firstName} — Patas &amp; Passos</p>
          </div>
          <LogoutButton />
        </div>
        <AdminDesktopNav isAdmin={staff.profile.role === "admin"} />
      </header>

      <div className="portal-content">{children}</div>

      <AdminBottomNav isAdmin={staff.profile.role === "admin"} />
    </div>
  );
}
