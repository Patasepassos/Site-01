import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { markCommissionsAsPaid } from "@/lib/partners/commission-engine";
import { describeError } from "@/lib/partners/errors";
import type { PayoutStatus } from "@/lib/supabase/types";

const ALLOWED_STATUSES: PayoutStatus[] = ["em_analise", "aprovado", "pago", "recusado"];

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? (body.status as PayoutStatus) : null;
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: payout } = await supabaseAdmin.from("payouts").select("*").eq("id", params.id).maybeSingle();
  if (!payout) return NextResponse.json({ error: "Saque não encontrado." }, { status: 404 });
  if (payout.status === "pago" || payout.status === "recusado") {
    return NextResponse.json({ error: "Este saque já foi finalizado." }, { status: 400 });
  }

  const nowIso = new Date().toISOString();

  try {
    if (status === "pago") {
      await markCommissionsAsPaid(supabaseAdmin, payout.partner_id, Number(payout.amount));
    }

    const { error } = await supabaseAdmin
      .from("payouts")
      .update({ status, processed_by: admin.userId, processed_at: nowIso })
      .eq("id", payout.id);
    if (error) throw error;

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: "admin",
      action: "payout_status_updated",
      entityType: "payout",
      entityId: payout.id,
      metadata: { status, amount: payout.amount },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao atualizar saque:", describeError(err));
    return NextResponse.json({ error: "Não foi possível atualizar o saque." }, { status: 500 });
  }
}
