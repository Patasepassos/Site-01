import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { isAvatarKey } from "@/lib/partners/avatars";

/**
 * Troca de avatar é só personalização/gamificação — nunca aceita o parceiro
 * alvo do corpo da requisição, sempre o dono da própria sessão (mesmo padrão
 * anti-IDOR usado em /api/parceiros/nome e /api/parceiros/perfil).
 */
export async function PATCH(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  let body: { avatarKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  if (!isAvatarKey(body.avatarKey)) {
    return NextResponse.json({ error: "Avatar inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("profiles").update({ avatar_key: body.avatarKey }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Não foi possível salvar o avatar." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: user.id,
    actorRole: "partner",
    action: "partner_avatar_changed",
    entityType: "profile",
    entityId: user.id,
    metadata: { avatarKey: body.avatarKey },
  });

  return NextResponse.json({ success: true });
}
