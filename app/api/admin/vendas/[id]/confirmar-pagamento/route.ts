import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { getPartnerProgress, recalculatePartnerCommissions } from "@/lib/partners/commission-engine";
import { describeError } from "@/lib/partners/errors";

/**
 * Confirma o pagamento de uma venda já fechada. Só a partir daqui a venda
 * entra no cálculo de comissão (meta de clientes + valor da comissão) — uma
 * venda fechada com pagamento pendente nunca conta.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: sale } = await supabaseAdmin.from("sales").select("*").eq("id", params.id).maybeSingle();
  if (!sale) return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  if (sale.payment_status !== "pendente") {
    return NextResponse.json({ error: "Esta venda já foi processada." }, { status: 400 });
  }

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("partner_id")
    .eq("id", sale.customer_id)
    .maybeSingle();
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  try {
    const progressBefore = await getPartnerProgress(supabaseAdmin, customer.partner_id);

    const { error: updateError } = await supabaseAdmin
      .from("sales")
      .update({ payment_status: "confirmado" })
      .eq("id", sale.id);
    if (updateError) throw updateError;

    await recalculatePartnerCommissions(supabaseAdmin, customer.partner_id);

    const progressAfter = await getPartnerProgress(supabaseAdmin, customer.partner_id);
    if (progressBefore.locked && !progressAfter.locked) {
      await supabaseAdmin.from("partner_notifications").insert({
        partner_id: customer.partner_id,
        customer_id: sale.customer_id,
        type: "comissao_liberada",
        message: "🔓 Meta desbloqueada! Sua comissão já pode ser consultada e sacada.",
      });
    }

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: admin.profile.role,
      action: "payment_confirmed",
      entityType: "sale",
      entityId: sale.id,
      metadata: { customerId: sale.customer_id, partnerId: customer.partner_id, amount: sale.amount },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao confirmar pagamento:", describeError(err));
    return NextResponse.json({ error: "Não foi possível confirmar o pagamento." }, { status: 500 });
  }
}
