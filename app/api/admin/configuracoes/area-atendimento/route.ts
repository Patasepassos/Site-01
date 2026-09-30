import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

export async function PATCH(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (note.length < 10) return NextResponse.json({ error: "Descreva a área de atendimento com mais detalhes." }, { status: 400 });

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: "partner_service_area_note", value: note, updated_at: new Date().toISOString(), updated_by: admin.userId });
  if (error) return NextResponse.json({ error: "Não foi possível salvar." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "partner_service_area_updated",
    entityType: "app_setting",
    entityId: "partner_service_area_note",
    metadata: { note },
  });

  return NextResponse.json({ success: true });
}
