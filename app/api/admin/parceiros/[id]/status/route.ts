import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
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
  const update: { status: PartnerStatus; approved_at?: string; approved_by?: string; financial_data_verified?: boolean } = {
    status,
  };
  if (status === "active") {
    update.approved_at = new Date().toISOString();
    update.approved_by = admin.userId;
    // Aprovar o parceiro é o momento em que o admin revisa os dados (Pix
    // incluído) — trata como a aprovação dos dados financeiros também.
    update.financial_data_verified = true;
  }

  const { error } = await supabaseAdmin.from("partners").update(update).eq("id", params.id);
  if (error) {
    return NextResponse.json({ error: "Não foi possível atualizar o parceiro." }, { status: 500 });
  }

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: admin.profile.role,
    action: "partner_status_updated",
    entityType: "partner",
    entityId: params.id,
    metadata: { status },
  });

  await recomputePartnerEligibility(supabaseAdmin, params.id, { id: admin.userId, role: admin.profile.role });

  return NextResponse.json({ success: true });
}
