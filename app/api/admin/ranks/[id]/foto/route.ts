import { NextResponse } from "next/server";
import { requireOwnerUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { describeError } from "@/lib/partners/errors";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function extensionFor(file: File): string {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Troca a foto de um nível de Rank. Só admin chefe (profiles.is_owner) --
 * é a identidade visual do programa inteiro, não uma edição operacional do
 * dia a dia. Bucket público (migração 0019): nenhum dado sensível, é só a
 * arte exibida no painel do parceiro.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const owner = await requireOwnerUser();
  if (!owner) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const photo = form.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máximo 4MB)." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(photo.type)) {
    return NextResponse.json({ error: "Formato inválido. Envie JPG, PNG ou WEBP." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: tier } = await supabaseAdmin.from("rank_tiers").select("id, key").eq("id", params.id).maybeSingle();
  if (!tier) return NextResponse.json({ error: "Nível não encontrado." }, { status: 404 });

  try {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const path = `${tier.key}-${Date.now()}.${extensionFor(photo)}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("rank-photos")
      .upload(path, buffer, { contentType: photo.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabaseAdmin.storage.from("rank-photos").getPublicUrl(path);

    const { error: updateError } = await supabaseAdmin
      .from("rank_tiers")
      .update({ photo_url: publicUrl.publicUrl, updated_by: owner.userId, updated_at: new Date().toISOString() })
      .eq("id", tier.id);
    if (updateError) throw updateError;

    await logAudit(supabaseAdmin, {
      actorId: owner.userId,
      actorRole: "admin",
      action: "rank_tier_photo_updated",
      entityType: "rank_tier",
      entityId: tier.id,
    });

    return NextResponse.json({ success: true, photoUrl: publicUrl.publicUrl });
  } catch (err) {
    console.error("Erro ao trocar foto do nível de rank:", describeError(err));
    return NextResponse.json({ error: "Não foi possível salvar a foto." }, { status: 500 });
  }
}
