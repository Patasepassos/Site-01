import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import type { RankLedStyle } from "@/lib/supabase/types";

const LED_STYLES: RankLedStyle[] = ["none", "static", "pulse_gold", "neon", "aura"];

/**
 * Edita um nível de Rank (meta/benefícios de vitrine) — nunca cria/exclui
 * nível, os 5 são fixos por design (rank_tiers.key). Só admin, nunca
 * operador: afeta o que é mostrado como "meta" pro programa inteiro.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: {
    minClients?: unknown;
    basePercentage?: unknown;
    recurringPercentage?: unknown;
    bonusText?: unknown;
    ledStyle?: unknown;
    active?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const update: {
    min_clients?: number;
    base_percentage?: number;
    recurring_percentage?: number;
    bonus_text?: string;
    led_style?: RankLedStyle;
    active?: boolean;
    updated_by: string;
    updated_at: string;
  } = {
    updated_by: admin.userId,
    updated_at: new Date().toISOString(),
  };

  if (body.minClients !== undefined) {
    const minClients = Number(body.minClients);
    if (!Number.isInteger(minClients) || minClients < 0) {
      return NextResponse.json({ error: "Meta de clientes inválida." }, { status: 400 });
    }
    update.min_clients = minClients;
  }

  if (body.basePercentage !== undefined) {
    const basePercentage = Number(body.basePercentage);
    if (!Number.isFinite(basePercentage) || basePercentage < 0) {
      return NextResponse.json({ error: "Comissão base inválida." }, { status: 400 });
    }
    update.base_percentage = basePercentage;
  }

  if (body.recurringPercentage !== undefined) {
    const recurringPercentage = Number(body.recurringPercentage);
    if (!Number.isFinite(recurringPercentage) || recurringPercentage < 0) {
      return NextResponse.json({ error: "Recorrência inválida." }, { status: 400 });
    }
    update.recurring_percentage = recurringPercentage;
  }

  if (body.bonusText !== undefined) {
    if (typeof body.bonusText !== "string") {
      return NextResponse.json({ error: "Texto de benefício inválido." }, { status: 400 });
    }
    update.bonus_text = body.bonusText.trim();
  }

  if (body.ledStyle !== undefined) {
    if (typeof body.ledStyle !== "string" || !LED_STYLES.includes(body.ledStyle as RankLedStyle)) {
      return NextResponse.json({ error: "Estilo de LED inválido." }, { status: 400 });
    }
    update.led_style = body.ledStyle as RankLedStyle;
  }

  if (body.active !== undefined) {
    update.active = body.active === true;
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin.from("rank_tiers").update(update).eq("id", params.id);
  if (error) return NextResponse.json({ error: "Não foi possível salvar o nível." }, { status: 500 });

  await logAudit(supabaseAdmin, {
    actorId: admin.userId,
    actorRole: "admin",
    action: "rank_tier_updated",
    entityType: "rank_tier",
    entityId: params.id,
    metadata: update,
  });

  return NextResponse.json({ success: true });
}
