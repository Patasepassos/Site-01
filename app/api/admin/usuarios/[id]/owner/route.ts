import { NextResponse } from "next/server";
import { requireOwnerUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";

/**
 * Concede/revoga "admin chefe" (profiles.is_owner) de outro admin. Só quem
 * já é admin chefe pode conceder esse nível pra mais alguém — evita um
 * admin comum se auto-promover.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwnerUser();
  if (!owner) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { isOwner?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const isOwner = body.isOwner === true;

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: target } = await supabaseAdmin.from("profiles").select("*").eq("id", params.id).maybeSingle();
  if (!target || target.role !== "admin") {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  if (!isOwner && params.id === owner.userId) {
    const { count } = await supabaseAdmin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin")
      .eq("is_owner", true)
      .eq("active", true);
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: "Precisa existir pelo menos um admin chefe ativo." }, { status: 400 });
    }
  }

  const { error } = await supabaseAdmin.from("profiles").update({ is_owner: isOwner }).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar o usuário." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: owner.userId,
    actorRole: "admin",
    action: isOwner ? "owner_granted" : "owner_revoked",
    entityType: "profile",
    entityId: params.id,
  });

  return NextResponse.json({ success: true });
}
