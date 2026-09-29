import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { describeError } from "@/lib/partners/errors";

/**
 * Confirmação manual do admin de que o WhatsApp do parceiro é real (ligou
 * ou mandou mensagem e confirmou). Não existe verificação automática por
 * código — não temos WhatsApp Business API pra isso.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { verified?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }
  const verified = body.verified === true;

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin.from("partners").select("id").eq("id", params.id).maybeSingle();
  if (!partner) {
    return NextResponse.json(
      { error: "Este parceiro não existe mais. Atualize a página (F5) e tente de novo." },
      { status: 404 }
    );
  }

  const { error } = await supabaseAdmin.from("partners").update({ whatsapp_verified: verified }).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: admin.profile.role,
    action: "partner_whatsapp_verified_updated",
    entityType: "partner",
    entityId: params.id,
    metadata: { verified },
  });

  try {
    await recomputePartnerEligibility(supabaseAdmin, params.id, { id: admin.userId, role: admin.profile.role });
  } catch (err) {
    console.error("Erro ao recalcular elegibilidade:", describeError(err));
    return NextResponse.json({ error: "WhatsApp atualizado, mas não foi possível recalcular a elegibilidade." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
