import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { notifyPartner } from "@/lib/partners/notifications";
import { formatCustomerLabel } from "@/lib/partners/labels";
import type { CustomerStatus } from "@/lib/supabase/types";

// "fechado" nunca passa por aqui — precisa dos dados da venda (valor,
// contrato), então tem sua própria rota (/fechar) que grava a venda e
// recalcula as comissões no mesmo passo.
const ALLOWED_STATUSES: CustomerStatus[] = [
  "indicado",
  "em_contato",
  "em_negociacao",
  "servico_contratado",
  "cancelado",
  "nao_convertido",
];

const STATUS_MESSAGES: Partial<Record<CustomerStatus, string>> = {
  em_contato: "📞 Já entramos em contato com o cliente que você indicou.",
  em_negociacao: "🤝 Sua indicação está em negociação com a equipe.",
  servico_contratado: "✅ O cliente que você indicou contratou o serviço! Em breve fechamos a venda.",
  cancelado: "❌ A negociação com o cliente que você indicou foi cancelada.",
  nao_convertido: "❌ O cliente que você indicou não foi convertido.",
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? (body.status as CustomerStatus) : null;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("partner_id, sequence_number")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "Não foi possível atualizar o cliente." }, { status: 500 });
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: admin.profile.role,
    action: "customer_status_updated",
    entityType: "customer",
    entityId: params.id,
    metadata: { status },
  });

  const message = STATUS_MESSAGES[status];
  if (message) {
    await notifyPartner(supabaseAdmin, {
      partnerId: customer.partner_id,
      customerId: params.id,
      type: "indicacao_status_atualizado",
      message: `${message} (${formatCustomerLabel(customer.sequence_number)})`,
    });
  }

  return NextResponse.json({ success: true });
}
