import { redirect } from "next/navigation";
import { getCurrentPartner } from "@/lib/partners/session";
import EditProfileForm from "@/components/portal/EditProfileForm";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";

export default async function PerfilPage() {
  const current = await getCurrentPartner();
  if (!current) redirect("/parceiros/login");

  return (
    <>
      <div className="portal-card">
        <h2>Meus dados</h2>
        <p style={{ marginTop: 8 }}>
          <b>Nome:</b> {current.profile.full_name}
          <br />
          <b>E-mail:</b> {current.email}
          <br />
          <b>Cupom:</b> {current.partner.coupon_code}
        </p>
      </div>

      <div className="portal-card">
        <h2>WhatsApp e Pix</h2>
        <EditProfileForm
          initialPhone={current.profile.phone}
          initialPixKey={current.partner.pix_key}
          initialPixKeyType={current.partner.pix_key_type}
        />
      </div>

      <div className="portal-card">
        <h2>Trocar senha</h2>
        <ChangePasswordForm />
      </div>
    </>
  );
}
