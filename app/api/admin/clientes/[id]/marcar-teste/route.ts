import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { isTest?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const isTest = body.isTest === true;

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("customers").update({ is_test: isTest }).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar o cliente." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "customer_test_flag_updated",
    entityType: "customer",
    entityId: params.id,
    metadata: { isTest },
  });

  return NextResponse.json({ success: true });
}
