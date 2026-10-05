import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { maskSecret } from "@/lib/partners/mask";

type PixBody = { action?: unknown };

/**
 * Único ponto que devolve a chave Pix COMPLETA de um parceiro. Reservado a
 * admin (não operador) -- mesmo guard usado em /saques/[id]/pagar, a rota
 * que efetivamente movimenta dinheiro. Nunca embutido no HTML da página;
 * só entregue sob demanda, por chamada autenticada, com auditoria.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: PixBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const action = body.action === "copy" ? "copy" : "view";

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("pix_key, pix_key_type")
    .eq("id", params.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: admin.profile.role,
    action: action === "copy" ? "partner_pix_key_copied" : "partner_pix_key_viewed",
    entityType: "partner",
    entityId: params.id,
    // Nunca a chave completa em log -- só o tipo e a versão mascarada.
    metadata: { pixKeyType: partner.pix_key_type, pixKeyMasked: maskSecret(partner.pix_key) },
  });

  return NextResponse.json({ pixKey: partner.pix_key });
}
