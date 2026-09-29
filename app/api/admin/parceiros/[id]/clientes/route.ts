import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { SERVICE_KEYS } from "@/lib/partners/labels";
import type { ServiceKey } from "@/lib/supabase/types";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { service?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const service = typeof body.service === "string" ? (body.service as ServiceKey) : null;
  if (!service || !SERVICE_KEYS.includes(service)) {
    return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const { data: partner } = await supabaseAdmin
    .from("partners")
    .select("id, coupon_code")
    .eq("id", params.id)
    .maybeSingle();
  if (!partner) return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .insert({
      partner_id: partner.id,
      service,
      status: "indicado",
      coupon_used: partner.coupon_code,
    })
    .select("id")
    .single();

  if (error || !customer) {
    return NextResponse.json({ error: "Não foi possível adicionar o cliente." }, { status: 500 });
  }

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "customer_added_manually",
    entityType: "customer",
    entityId: customer.id,
    metadata: { partnerId: partner.id, service },
  });

  return NextResponse.json({ success: true });
}
