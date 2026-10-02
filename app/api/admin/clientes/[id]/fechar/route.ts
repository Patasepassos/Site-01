import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recalculatePartnerCommissions } from "@/lib/partners/commission-engine";
import { notifyPartner } from "@/lib/partners/notifications";
import { describeError } from "@/lib/partners/errors";
import { formatCustomerLabel, SERVICE_LABELS } from "@/lib/partners/labels";
import type { ContractType } from "@/lib/supabase/types";

const CONTRACT_TYPES: ContractType[] = ["avulso", "mensal", "anual"];

/**
 * Fecha uma venda (tela de fechamento — o WhatsApp é o canal, isso é o
 * registro que o atendente faz depois de fechar por lá). Grava o valor real
 * na tabela `sales` (nunca vindo do parceiro — só o admin registra), marca
 * o cliente como fechado com pagamento PENDENTE e avisa o parceiro. A
 * comissão só é calculada depois que o admin confirma o pagamento — o valor
 * da venda em si nunca é exposto para o parceiro.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { amount?: unknown; contractType?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const contractType = typeof body.contractType === "string" ? (body.contractType as ContractType) : null;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Valor de venda inválido." }, { status: 400 });
  }
  if (!contractType || !CONTRACT_TYPES.includes(contractType)) {
    return NextResponse.json({ error: "Tipo de contrato inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  const nowIso = new Date().toISOString();

  try {
    const { data: sale, error: saleError } = await supabaseAdmin
      .from("sales")
      .insert({
        customer_id: customer.id,
        service: customer.service,
        contract_type: contractType,
        amount,
        created_by: admin.userId,
      })
      .select("id")
      .single();
    if (saleError || !sale) throw saleError ?? new Error("Falha ao registrar a venda.");

    // Nunca sobrescreve customer_name/customer_phone aqui -- esses dados já
    // vieram certos do próprio parceiro no registro da indicação; reescrever
    // com um valor vazio nessa tela apagava o nome/telefone reais do cliente.
    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .update({ status: "fechado", closed_at: nowIso, updated_at: nowIso })
      .eq("id", customer.id);
    if (customerError) throw customerError;

    await notifyPartner(supabaseAdmin, {
      partnerId: customer.partner_id,
      customerId: customer.id,
      type: "indicacao_convertida",
      message: `🎉 Venda fechada! Sua indicação (${formatCustomerLabel(customer.sequence_number)} — ${SERVICE_LABELS[customer.service]}) foi convertida em cliente da Patas & Passos.`,
    });

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: admin.profile.role,
      action: "sale_closed",
      entityType: "sale",
      entityId: sale.id,
      metadata: { customerId: customer.id, partnerId: customer.partner_id, contractType, amount },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao fechar venda:", describeError(err));
    return NextResponse.json({ error: "Não foi possível fechar a venda." }, { status: 500 });
  }
}
