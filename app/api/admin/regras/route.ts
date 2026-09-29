import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { SERVICE_KEYS } from "@/lib/partners/labels";
import type { CommissionRuleType, ServiceKey } from "@/lib/supabase/types";

const RULE_TYPES: CommissionRuleType[] = ["meta_clientes", "recorrencia"];

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: {
    name?: unknown;
    service?: unknown;
    ruleType?: unknown;
    percentage?: unknown;
    minClients?: unknown;
    recurring?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const service = typeof body.service === "string" ? (body.service as ServiceKey) : null;
  const ruleType = typeof body.ruleType === "string" ? (body.ruleType as CommissionRuleType) : null;
  const percentage = Number(body.percentage);
  const minClients = Number(body.minClients);
  const recurring = body.recurring === true;

  if (name.length < 3) return NextResponse.json({ error: "Dê um nome para a regra." }, { status: 400 });
  if (service && !SERVICE_KEYS.includes(service)) {
    return NextResponse.json({ error: "Serviço inválido." }, { status: 400 });
  }
  if (!ruleType || !RULE_TYPES.includes(ruleType)) {
    return NextResponse.json({ error: "Tipo de regra inválido." }, { status: 400 });
  }
  if (!Number.isFinite(percentage) || percentage < 0) {
    return NextResponse.json({ error: "Percentual inválido." }, { status: 400 });
  }
  if (!Number.isInteger(minClients) || minClients < 1) {
    return NextResponse.json({ error: "Mínimo de clientes inválido." }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: rule, error } = await supabaseAdmin
    .from("commission_rules")
    .insert({
      name,
      service,
      rule_type: ruleType,
      percentage,
      min_clients: minClients,
      recurring,
      active: true,
      updated_by: admin.userId,
    })
    .select("id")
    .single();

  if (error || !rule) return NextResponse.json({ error: "Não foi possível criar a regra." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "commission_rule_created",
    entityType: "commission_rule",
    entityId: rule.id,
    metadata: { name, service, ruleType, percentage, minClients, recurring },
  });

  return NextResponse.json({ success: true });
}
