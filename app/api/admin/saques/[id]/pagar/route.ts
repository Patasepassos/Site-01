import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { markCommissionsAsPaid } from "@/lib/partners/commission-engine";
import { recomputePartnerEligibility } from "@/lib/partners/eligibility";
import { getActivePaymentProvider } from "@/lib/payments/provider";
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
 * Confirma o pagamento de um saque. Máquina de estados real:
 * aprovado -> pago (nunca pulado, nunca revertido). A transição em si é um
 * UPDATE condicional no banco (`where status = 'aprovado'`) — se duas
 * requisições chegarem juntas (duplo clique, retry de rede), só a primeira
 * consegue mudar o status; a segunda recebe 409, não paga de novo. A chave
 * de idempotência do cliente cobre o caso de retry exato da mesma
 * requisição: se já foi processada com essa chave, devolve sucesso sem
 * repetir a ação.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: payout } = await supabaseAdmin.from("payouts").select("*").eq("id", params.id).maybeSingle();
  if (!payout) return NextResponse.json({ error: "Saque não encontrado." }, { status: 404 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const paymentMethod = String(form.get("paymentMethod") ?? "").trim();
  const notes = String(form.get("notes") ?? "").trim();
  const transactionReference = String(form.get("transactionReference") ?? "").trim();
  const idempotencyKey = String(form.get("idempotencyKey") ?? "").trim();
  const proof = form.get("proof");

  if (!idempotencyKey) return NextResponse.json({ error: "Requisição inválida (sem chave de idempotência)." }, { status: 400 });

  // Replay exato da mesma requisição já processada: devolve sucesso sem
  // repetir nada. Um saque "pago" com uma chave DIFERENTE da submetida
  // significa que outra confirmação já rodou nesse meio tempo.
  if (payout.status === "pago") {
    if (payout.idempotency_key === idempotencyKey) {
      return NextResponse.json({ success: true, replay: true });
    }
    return NextResponse.json({ error: "Este saque já foi pago." }, { status: 409 });
  }
  if (payout.status === "recusado") {
    return NextResponse.json({ error: "Este saque foi recusado e não pode ser pago." }, { status: 400 });
  }
  if (payout.status !== "aprovado") {
    return NextResponse.json({ error: "O saque precisa estar aprovado antes de confirmar o pagamento." }, { status: 400 });
  }

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

  const { data: partner } = await supabaseAdmin.from("partners").select("*").eq("id", payout.partner_id).maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  // Reverificação obrigatória: elegibilidade pode ter mudado desde que o
  // saque foi aprovado (ex.: parceiro trocou a chave Pix nesse meio tempo).
  const checklist = await recomputePartnerEligibility(supabaseAdmin, partner.id, {
    id: admin.userId,
    role: admin.profile.role,
  });
  if (!checklist.eligible) {
    return NextResponse.json(
      { error: "O parceiro não está mais apto para pagamento — dados precisam ser confirmados de novo antes de continuar." },
      { status: 409 }
    );
  }

  try {
    const provider = getActivePaymentProvider();
    const providerResult = await provider.payPixCommission({
      payoutId: payout.id,
      amount: Number(payout.amount),
      pixKey: partner.pix_key,
      pixKeyType: partner.pix_key_type,
      idempotencyKey,
    });

    const buffer = Buffer.from(await proof.arrayBuffer());
    const path = `${payout.partner_id}/${payout.id}-${Date.now()}.${extensionFor(proof)}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("comprovantes")
      .upload(path, buffer, { contentType: proof.type, upsert: false });
    if (uploadError) throw uploadError;

    const nowIso = new Date().toISOString();

    // Ponto de confirmação real: só muda de 'aprovado' pra 'pago' se ainda
    // estiver 'aprovado' agora. Se outra requisição já mudou, updated vem
    // vazio e a gente nunca marca a comissão como paga duas vezes.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("payouts")
      .update({
        status: "pago",
        payment_method: paymentMethod,
        notes: notes || null,
        proof_path: path,
        transaction_reference: transactionReference || null,
        idempotency_key: idempotencyKey,
        processed_by: admin.userId,
        processed_at: nowIso,
      })
      .eq("id", payout.id)
      .eq("status", "aprovado")
      .select()
      .maybeSingle();
    if (updateError) throw updateError;

    if (!updated) {
      return NextResponse.json({ error: "Este saque já foi processado por outra ação." }, { status: 409 });
    }

    await markCommissionsAsPaid(supabaseAdmin, payout.partner_id, Number(payout.amount));

    await supabaseAdmin.from("partner_notifications").insert({
      partner_id: payout.partner_id,
      type: "saque_atualizado",
      message: `💰 Seu pagamento de ${formatBRL(Number(payout.amount))} foi confirmado.`,
    });

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: admin.profile.role,
      action: "payout_paid",
      entityType: "payout",
      entityId: payout.id,
      metadata: {
        previousStatus: "aprovado",
        newStatus: "pago",
        amount: payout.amount,
        paymentMethod,
        transactionReference: transactionReference || null,
        idempotencyKey,
        provider: provider.name,
        providerTransactionId: providerResult.providerTransactionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao confirmar pagamento do saque:", describeError(err));
    return NextResponse.json({ error: "Não foi possível confirmar o pagamento." }, { status: 500 });
  }
}
