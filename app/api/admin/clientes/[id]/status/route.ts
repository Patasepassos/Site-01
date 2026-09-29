import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import type { CustomerStatus } from "@/lib/supabase/types";

// "fechado" nunca passa por aqui — precisa dos dados da venda (valor,
// contrato), então tem sua própria rota (/fechar) que grava a venda e
// recalcula as comissões no mesmo passo.
const ALLOWED_STATUSES: CustomerStatus[] = ["indicado", "em_contato", "em_negociacao", "cancelado", "nao_convertido"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
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
  const { error } = await supabaseAdmin
    .from("customers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: "Não foi possível atualizar o cliente." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "customer_status_updated",
    entityType: "customer",
    entityId: params.id,
    metadata: { status },
  });

  return NextResponse.json({ success: true });
}
