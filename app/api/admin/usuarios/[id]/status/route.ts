import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  if (params.id === admin.userId) {
    return NextResponse.json({ error: "Você não pode desativar sua própria conta." }, { status: 400 });
  }

  let body: { active?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const active = body.active === true;

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: target } = await supabaseAdmin.from("profiles").select("*").eq("id", params.id).maybeSingle();
  if (!target || (target.role !== "admin" && target.role !== "operator")) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (!active && target.role === "admin") {
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("active", true);
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: "Precisa existir pelo menos um administrador ativo." }, { status: 400 });
    }
  }

  const { error } = await supabaseAdmin.from("profiles").update({ active }).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: active ? "user_activated" : "user_deactivated",
    entityType: "profile",
    entityId: params.id,
  });

  return NextResponse.json({ success: true });
}
