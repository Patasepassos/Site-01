import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recalculatePartnerCommissions } from "@/lib/partners/commission-engine";
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
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: {
    amount?: unknown;
    contractType?: unknown;
    customerName?: unknown;
    customerPhone?: unknown;
    paymentMethod?: unknown;
    notes?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const amount = typeof body.amount === "number" ? body.amount : Number(body.amount);
  const contractType = typeof body.contractType === "string" ? (body.contractType as ContractType) : null;
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const customerPhone = typeof body.customerPhone === "string" ? body.customerPhone.trim() : "";
  const paymentMethod = typeof body.paymentMethod === "string" ? body.paymentMethod.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

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
        payment_method: paymentMethod || null,
        notes: notes || null,
        created_by: admin.userId,
      })
      .select("id")
      .single();
    if (saleError || !sale) throw saleError ?? new Error("Falha ao registrar a venda.");

    const { error: customerError } = await supabaseAdmin
      .from("customers")
      .update({
        status: "fechado",
        closed_at: nowIso,
        updated_at: nowIso,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
      })
      .eq("id", customer.id);
    if (customerError) throw customerError;

    await supabaseAdmin.from("partner_notifications").insert({
      partner_id: customer.partner_id,
      customer_id: customer.id,
      type: "indicacao_convertida",
      message: `Uma indicação sua resultou em uma nova contratação: ${formatCustomerLabel(customer.sequence_number)} — ${SERVICE_LABELS[customer.service]}.`,
    });

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: "admin",
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
