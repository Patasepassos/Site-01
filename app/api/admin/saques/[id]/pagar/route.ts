import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { markCommissionsAsPaid } from "@/lib/partners/commission-engine";
import { describeError } from "@/lib/partners/errors";
import { formatBRL } from "@/lib/partners/labels";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/**
 * Confirma o pagamento de um saque — exige o comprovante anexado. Só depois
 * disso a comissão correspondente vira "paga" (markCommissionsAsPaid).
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: payout } = await supabaseAdmin.from("payouts").select("*").eq("id", params.id).maybeSingle();
  if (!payout) return NextResponse.json({ error: "Saque não encontrado." }, { status: 404 });
  if (payout.status === "pago" || payout.status === "recusado") {
    return NextResponse.json({ error: "Este saque já foi finalizado." }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const paymentMethod = String(form.get("paymentMethod") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const proof = form.get("proof");

  if (!paymentMethod) return NextResponse.json({ error: "Informe a forma de pagamento." }, { status: 400 });
  if (!(proof instanceof File) || proof.size === 0) {
    return NextResponse.json({ error: "Anexe o comprovante de pagamento." }, { status: 400 });
  }
  if (proof.size > MAX_PROOF_BYTES) {
    return NextResponse.json({ error: "Comprovante muito grande (máximo 8MB)." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(proof.type)) {
    return NextResponse.json({ error: "Formato inválido. Envie uma imagem (JPG/PNG/WEBP) ou PDF." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await proof.arrayBuffer());
    const path = `${payout.partner_id}/${payout.id}-${Date.now()}.${extensionFor(proof)}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("comprovantes")
      .upload(path, buffer, { contentType: proof.type, upsert: false });
    if (uploadError) throw uploadError;

    await markCommissionsAsPaid(supabaseAdmin, payout.partner_id, Number(payout.amount));

    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin
      .from("payouts")
      .update({
        status: "pago",
        payment_method: paymentMethod,
        notes: notes || null,
        proof_path: path,
        processed_by: admin.userId,
        processed_at: nowIso,
      })
      .eq("id", payout.id);
    if (updateError) throw updateError;

    await supabaseAdmin.from("partner_notifications").insert({
      partner_id: payout.partner_id,
      type: "saque_atualizado",
      message: `💰 Seu pagamento de ${formatBRL(Number(payout.amount))} foi confirmado.`,
    });

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: "admin",
      action: "payout_paid",
      entityType: "payout",
      entityId: payout.id,
      metadata: { amount: payout.amount, paymentMethod },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao confirmar pagamento do saque:", describeError(err));
    return NextResponse.json({ error: "Não foi possível confirmar o pagamento." }, { status: 500 });
  }
}
