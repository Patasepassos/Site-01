import { NextResponse } from "next/server";
import { getBearerToken } from "@/lib/supabase/bearer";
import { getCurrentPartnerFromBearer } from "@/lib/partners/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveClientCount } from "@/lib/partners/active-clients";
import { getPartnerBalance } from "@/lib/partners/balance";

/**
 * Único jeito seguro do app mobile obter "clientes ativos" (usado no
 * Dashboard e no progresso de Rank) e o saldo — ambos exigem ler
 * sales.payment_status ou juntar linhas que a RLS de parceiro não expõe
 * diretamente. Nunca retorna sales.amount nem qualquer valor de venda.
 */
export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) return NextResponse.json({ error: "Token ausente." }, { status: 401 });

  const current = await getCurrentPartnerFromBearer(token);
  if (!current) return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });

  const supabaseAdmin = createSupabaseAdminClient();
  const [activeClients, balance] = await Promise.all([
    getActiveClientCount(supabaseAdmin, current.partner.id),
    getPartnerBalance(current.supabase, current.partner.id),
  ]);

  return NextResponse.json({ activeClients, balance });
}
