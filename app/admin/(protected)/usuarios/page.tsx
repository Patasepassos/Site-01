import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAuthUserInfoMap } from "@/lib/admin/auth-emails";
import { formatDate } from "@/lib/partners/labels";
import NewOperatorForm from "@/components/admin/NewOperatorForm";
import UserStatusToggle from "@/components/admin/UserStatusToggle";

const ROLE_LABELS: Record<string, string> = { admin: "Administrador", operator: "Operador" };

export default async function AdminUsuariosPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/parceiros");

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: staff } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .in("role", ["admin", "operator"])
    .order("created_at", { ascending: false });

  const userInfoMap = await getAuthUserInfoMap(supabaseAdmin, (staff ?? []).map((p) => p.id));

  return (
    <>
      <div className="portal-card">
        <h2>Usuários</h2>
        <p style={{ marginBottom: 4 }}>
          Administradores têm acesso completo. Operadores acessam o dia a dia (parceiros, indicações, vendas,
          saques) mas não mexem em regras de comissão, outros usuários, ou &quot;Zerar sistema&quot;.
        </p>

        <div style={{ marginTop: 14 }}>
          {!staff || staff.length === 0 ? (
            <p>Nenhum usuário cadastrado.</p>
          ) : (
            staff.map((profile) => {
              const info = userInfoMap.get(profile.id);
              return (
                <div className="referral-row" key={profile.id} style={{ alignItems: "flex-start" }}>
                  <div>
                    <div className="rr-id">
                      {profile.full_name}
                      {!profile.active && <span className="admin-badge-test">INATIVO</span>}
                    </div>
                    <div className="rr-meta">
                      {info?.email ?? "e-mail indisponível"} · {ROLE_LABELS[profile.role] ?? profile.role} · último
                      acesso: {info?.lastSignInAt ? formatDate(info.lastSignInAt) : "nunca"}
                    </div>
                  </div>
                  <UserStatusToggle userId={profile.id} active={profile.active} />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="portal-card">
        <h2>Novo operador</h2>
        <p style={{ marginBottom: 12 }}>
          Criar outro administrador não está disponível por aqui de propósito — é uma ação sensível demais pra um
          formulário simples.
        </p>
        <NewOperatorForm />
      </div>
    </>
  );
}
