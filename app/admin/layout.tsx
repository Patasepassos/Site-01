import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/guard";
import LogoutButton from "@/components/portal/LogoutButton";
import { AdminBottomNav, AdminDesktopNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminUser();
  if (!admin) redirect("/parceiros/login");

  const firstName = admin.profile.full_name.split(" ")[0];

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
        <AdminDesktopNav />
      </header>

      <div className="portal-content">{children}</div>

      <AdminBottomNav />
    </div>
  );
}
