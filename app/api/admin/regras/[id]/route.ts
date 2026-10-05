import { NextResponse } from "next/server";
import { requireOwnerUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireOwnerUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { percentage?: unknown; minClients?: unknown; active?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const update: { percentage?: number; min_clients?: number; active?: boolean; updated_by: string; updated_at: string } = {
    updated_by: admin.userId,
    updated_at: new Date().toISOString(),
  };

  if (body.percentage !== undefined) {
    const percentage = Number(body.percentage);
    if (!Number.isFinite(percentage) || percentage < 0) {
      return NextResponse.json({ error: "Percentual inválido." }, { status: 400 });
    }
    update.percentage = percentage;
  }

  if (body.minClients !== undefined) {
    const minClients = Number(body.minClients);
    if (!Number.isInteger(minClients) || minClients < 1) {
      return NextResponse.json({ error: "Mínimo de clientes inválido." }, { status: 400 });
    }
    update.min_clients = minClients;
  }

  if (body.active !== undefined) {
    update.active = body.active === true;
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("commission_rules").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível salvar a regra." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "commission_rule_updated",
    entityType: "commission_rule",
    entityId: params.id,
    metadata: update,
  });

  return NextResponse.json({ success: true });
}
