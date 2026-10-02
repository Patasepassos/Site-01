import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSystemCounts, wipeSystem, RealPaymentsExistError } from "@/lib/admin/system-reset";
import { describeError } from "@/lib/partners/errors";

const CONFIRM_PHRASE = "ZERAR PATAS";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const counts = await getSystemCounts(createSupabaseAdminClient());
  return NextResponse.json(counts);
}

export async function POST(request: Request) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  let body: { confirmText?: unknown; confirmRealPayments?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const confirmText = typeof body.confirmText === "string" ? body.confirmText : "";
  if (confirmText !== CONFIRM_PHRASE) {
    return NextResponse.json({ error: `Digite exatamente "${CONFIRM_PHRASE}" pra confirmar.` }, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();

  try {
    const removed = await wipeSystem(supabaseAdmin, admin.userId, {
      confirmRealPayments: body.confirmRealPayments === true,
    });
    return NextResponse.json({ success: true, removed });
  } catch (err) {
    if (err instanceof RealPaymentsExistError) {
      return NextResponse.json(
        {
          error:
            "Existem pagamentos reais registrados neste sistema. A exclusão desses dados pode comprometer o histórico financeiro.",
          needsRealPaymentsConfirm: true,
          counts: err.counts,
        },
        { status: 409 }
      );
    }
    console.error("Erro ao zerar sistema:", describeError(err));
    return NextResponse.json({ error: "Não foi possível zerar o sistema." }, { status: 500 });
  }
}
