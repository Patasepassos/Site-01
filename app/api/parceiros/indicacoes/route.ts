import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getBearerToken } from "@/lib/supabase/bearer";
import { getCurrentPartnerFromBearer } from "@/lib/partners/session";
import { logAudit } from "@/lib/partners/audit";
import { notifyAdmin } from "@/lib/email/admin-notify";
import { describeError } from "@/lib/partners/errors";
import { isValidPhone, onlyDigits } from "@/lib/partners/validation";
import { SERVICE_KEYS, SERVICE_LABELS, formatCustomerLabel } from "@/lib/partners/labels";
import type { Database, PartnerRow, ServiceKey } from "@/lib/supabase/types";

type IndicacaoBody = { fullName?: unknown; phone?: unknown; service?: unknown };

/**
 * Deixa o parceiro registrar a própria indicação assim que avisa o cliente,
 * em vez de depender do admin lançar isso manualmente depois de uma
 * conversa no WhatsApp -- o parceiro fica "no escuro" entre indicar e o
 * admin processar. O admin continua no controle de todo o resto do fluxo
 * (mover status, fechar venda, confirmar pagamento); isso só cria o
 * registro inicial com status 'indicado', igual ao que o admin já faz em
 * /admin/parceiros/[id]/clientes -- só que com nome/WhatsApp preenchidos
 * de cara, já que é o parceiro quem tem esse contato.
 */
export async function POST(request: Request) {
  let supabase: SupabaseClient<Database>;
  let userId: string;
  let partner: PartnerRow | null;

  const bearerToken = getBearerToken(request);
  if (bearerToken) {
    const current = await getCurrentPartnerFromBearer(bearerToken);
    if (!current) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    supabase = current.supabase;
    userId = current.userId;
    partner = current.partner;
  } else {
    supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });
    userId = user.id;
    const { data: p } = await supabase.from("partners").select("*").eq("profile_id", user.id).maybeSingle();
    partner = p;
  }

  if (!partner || partner.status !== "active") {
    return NextResponse.json({ error: "Parceiro não está ativo." }, { status: 403 });
  }

  let body: IndicacaoBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const service = typeof body.service === "string" ? (body.service as ServiceKey) : null;

  if (fullName.length < 3) return NextResponse.json({ error: "Informe o nome do cliente." }, { status: 400 });
  if (!isValidPhone(phone)) return NextResponse.json({ error: "WhatsApp inválido." }, { status: 400 });
  if (!service || !SERVICE_KEYS.includes(service)) {
    return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const phoneDigits = onlyDigits(phone);

  // Evita indicação duplicada do mesmo número enquanto a anterior ainda
  // estiver em andamento (cancelada/não convertida pode ser reindicada).
  const { data: existing } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("partner_id", partner.id)
    .eq("customer_phone", phoneDigits)
    .is("archived_at", null)
    .not("status", "in", "(cancelado,nao_convertido)")
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "Você já registrou uma indicação em andamento para esse número." }, { status: 409 });
  }

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .insert({
      partner_id: partner.id,
      service,
      status: "indicado",
      coupon_used: partner.coupon_code,
      customer_name: fullName,
      customer_phone: phoneDigits,
    })
    .select("id, sequence_number")
    .single();

  if (error || !customer) {
    return NextResponse.json({ error: "Não foi possível registrar a indicação." }, { status: 500 });
  }

  // DEBUG temporário: confirma com uma releitura separada que a linha está
  // mesmo visível logo depois do insert, com o partner_id/status corretos.
  const { data: verify, error: verifyError } = await supabaseAdmin
    .from("customers")
    .select("id, partner_id, status, archived_at, is_test, created_at")
    .eq("id", customer.id)
    .maybeSingle();
  console.log("[DEBUG indicacoes] insert", {
    customerId: customer.id,
    sequenceNumber: customer.sequence_number,
    partnerId: partner.id,
    partnerCoupon: partner.coupon_code,
    partnerStatus: partner.status,
  });
  console.log("[DEBUG indicacoes] releitura pós-insert", { verify, verifyError });

  await logAudit(supabaseAdmin, {
    actorId: userId,
    actorRole: "partner",
    action: "customer_added_by_partner",
    entityType: "customer",
    entityId: customer.id,
    metadata: { partnerId: partner.id, service },
  });

  try {
    await notifyAdmin({
      subject: "📣 Nova indicação registrada pelo parceiro",
      html: `<p>Um parceiro acabou de registrar uma indicação direto pelo painel.</p>
<p><strong>Cupom do parceiro:</strong> ${partner.coupon_code}<br/>
<strong>Serviço:</strong> ${SERVICE_LABELS[service]}<br/>
<strong>Cliente:</strong> ${fullName}<br/>
<strong>WhatsApp:</strong> ${phoneDigits}</p>
<p>Veja e mova o status em /admin/parceiros/${partner.id}.</p>`,
    });
  } catch (err) {
    console.error("Falha ao notificar admin sobre indicação registrada pelo parceiro:", describeError(err));
  }

  return NextResponse.json({ success: true, label: formatCustomerLabel(customer.sequence_number) });
}
