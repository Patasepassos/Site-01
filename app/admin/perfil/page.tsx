import { redirect } from "next/navigation";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthEmailMap } from "@/lib/admin/auth-emails";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";
import MfaSetup from "@/components/MfaSetup";

const ROLE_LABELS: Record<string, string> = { admin: "Administrador", operator: "Operador" };

export default async function AdminPerfilPage() {
  const staff = await requireStaffUser();
  if (!staff) redirect("/admin/login");

  const emailMap = await getAuthEmailMap(createSupabaseAdminClient(), [staff.userId]);

  return (
    <>
      <div className="portal-card">
        <h2>Meus dados</h2>
        <p style={{ marginTop: 8 }}>
          <b>Nome:</b> {staff.profile.full_name}
          <br />
          <b>E-mail:</b> {emailMap.get(staff.userId) ?? "—"}
          <br />
          <b>Papel:</b> {ROLE_LABELS[staff.profile.role] ?? staff.profile.role}
        </p>
      </div>

      <div className="portal-card">
        <h2>Trocar senha</h2>
        <ChangePasswordForm />
      </div>

      <div className="portal-card">
        <h2>Autenticação em dois fatores</h2>
        <MfaSetup />
      </div>
    </>
  );
}
