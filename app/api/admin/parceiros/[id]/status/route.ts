import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { notifyPartner } from "@/lib/partners/notifications";
import { describeError } from "@/lib/partners/errors";
import type { PartnerStatus } from "@/lib/supabase/types";

const ALLOWED_STATUSES: PartnerStatus[] = ["pending", "active", "blocked"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireStaffUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? (body.status as PartnerStatus) : null;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin.from("partners").select("id, status").eq("id", params.id).maybeSingle();
  if (!partner) {
    return NextResponse.json(
      { error: "Este parceiro não existe mais. Atualize a página (F5) e tente de novo." },
      { status: 404 }
    );
  }

  // Aprovação de dados financeiros é uma ação dedicada e desacoplada dessa
  // (ver /api/admin/parceiros/[id]/dados-financeiros) — aprovar o status
  // geral do parceiro não aprova mais o financeiro junto, de propósito.
  const update: { status: PartnerStatus; approved_at?: string; approved_by?: string } = {
    status,
  };
  if (status === "active") {
    update.approved_at = new Date().toISOString();
    update.approved_by = admin.userId;
  }

  const { error } = await supabaseAdmin.from("partners").update(update).eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: "Não foi possível atualizar o parceiro." }, { status: 500 });
  }

  // Só notifica o parceiro na transição real pending -> active (não repete a
  // cada re-salvamento do mesmo status "active").
  if (status === "active" && partner.status === "pending") {
    await notifyPartner(supabaseAdmin, {
      partnerId: params.id,
      type: "parceiro_aprovado",
      message: "🎉 Você foi aprovado! Seu painel de parceiro Patas & Passos já está liberado.",
    });
  }

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: admin.profile.role,
    action: "partner_status_updated",
    entityType: "partner",
    entityId: params.id,
    metadata: { status },
  });

  try {
    await recomputePartnerEligibility(supabaseAdmin, params.id, { id: admin.userId, role: admin.profile.role });
  } catch (err) {
    console.error("Erro ao recalcular elegibilidade:", describeError(err));
    return NextResponse.json({ error: "Status atualizado, mas não foi possível recalcular a elegibilidade." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
