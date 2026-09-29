import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { archived?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const archived = body.archived === true;

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("customers")
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar o registro." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: archived ? "customer_archived" : "customer_unarchived",
    entityType: "customer",
    entityId: params.id,
  });

  return NextResponse.json({ success: true });
}
