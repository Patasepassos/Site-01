import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

/** Cancela uma venda com pagamento pendente (cliente desistiu, chargeback etc). */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: sale } = await supabaseAdmin.from("sales").select("*").eq("id", params.id).maybeSingle();
  if (!sale) return NextResponse.json({ error: "Venda não encontrada." }, { status: 404 });
  if (sale.payment_status !== "pendente") {
    return NextResponse.json({ error: "Esta venda já foi processada." }, { status: 400 });
  }

  const { error: saleError } = await supabaseAdmin
    .from("sales")
    .update({ payment_status: "cancelado" })
    .eq("id", sale.id);
  if (saleError) return NextResponse.json({ error: "Não foi possível cancelar a venda." }, { status: 500 });

  const { error: customerError } = await supabaseAdmin
    .from("customers")
    .update({ status: "cancelado", updated_at: new Date().toISOString() })
    .eq("id", sale.customer_id);
  if (customerError) return NextResponse.json({ error: "Não foi possível atualizar o cliente." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "sale_cancelled",
    entityType: "sale",
    entityId: sale.id,
    metadata: { customerId: sale.customer_id },
  });

  return NextResponse.json({ success: true });
}
