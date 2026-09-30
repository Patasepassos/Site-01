import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPartnerServiceAreaNote } from "@/lib/partners/settings";
import RemoveTestDataButton from "@/components/admin/RemoveTestDataButton";
import WipeSystemButton from "@/components/admin/WipeSystemButton";
import ServiceAreaNoteForm from "@/components/admin/ServiceAreaNoteForm";

export default async function AdminSistemaPage() {
  const admin = await requireAdminUser();
  if (!admin) redirect("/admin/parceiros");

  const serviceAreaNote = await getPartnerServiceAreaNote(createSupabaseAdminClient());

  return (
    <>
      <div className="portal-card">
        <h2>📍 Área de atendimento (programa de parceria)</h2>
        <p style={{ marginBottom: 12 }}>
          Mostrado no painel do parceiro antes de ele começar a divulgar. Só indicações de regiões atendidas geram
          comissão válida.
        </p>
        <ServiceAreaNoteForm initialNote={serviceAreaNote} />
      </div>

      <div className="portal-card">
        <h2>🧹 Dados de teste</h2>
        <p style={{ marginBottom: 12 }}>
          Remove só os parceiros e clientes marcados como teste (⋮ → Marcar como teste, em cada registro). Vendas
          reais, parceiros reais e pagamentos já registrados nunca são afetados por este botão.
        </p>
        <RemoveTestDataButton />
      </div>

      <div className="portal-card">
        <h2>⚠️ Zona de risco</h2>
        <p style={{ marginBottom: 12 }}>
          Apaga TODOS os parceiros, indicações, vendas, comissões e saques do sistema — não só os de teste. Use
          apenas pra reiniciar o painel do zero. As regras de comissão configuradas continuam intactas.
        </p>
        <WipeSystemButton />
      </div>
    </>
  );
}
