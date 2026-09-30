import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { describeError } from "@/lib/partners/errors";
import type { FinancialDataStatus } from "@/lib/supabase/types";

const ALLOWED_STATUSES: FinancialDataStatus[] = ["approved", "rejected"];

/**
 * Aprovação manual dos dados financeiros/Pix do parceiro -- nunca automática,
 * nunca chama API externa. Ação dedicada, separada da aprovação geral do
 * parceiro (status active/blocked).
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { status?: unknown; note?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? (body.status as FinancialDataStatus) : null;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (status === "rejected" && note.length < 3) {
    return NextResponse.json({ error: "Informe o motivo da correção necessária." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin.from("partners").select("id").eq("id", params.id).maybeSingle();
  if (!partner) {
    return NextResponse.json(
      { error: "Este parceiro não existe mais. Atualize a página (F5) e tente de novo." },
      { status: 404 }
    );
  }

  const { error } = await supabaseAdmin
    .from("partners")
    .update({
      financial_data_status: status,
      financial_data_reviewed_at: new Date().toISOString(),
      financial_data_review_note: status === "rejected" ? note : null,
    })
    .eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível atualizar." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: admin.profile.role,
    action: "partner_financial_data_reviewed",
    entityType: "partner",
    entityId: params.id,
    metadata: { status },
  });

  try {
    await recomputePartnerEligibility(supabaseAdmin, params.id, { id: admin.userId, role: admin.profile.role });
  } catch (err) {
    console.error("Erro ao recalcular elegibilidade:", describeError(err));
    return NextResponse.json(
      { error: "Dados financeiros atualizados, mas não foi possível recalcular a elegibilidade." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
