import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/partners/audit";
import { describeError } from "@/lib/partners/errors";

/**
 * Exclui uma indicação/venda. Se já existir comissão paga vinculada, exige
 * `?force=true` — a exclusão simples é bloqueada pra não sumir com histórico
 * financeiro por engano.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const force = new URL(request.url).searchParams.get("force") === "true";
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: customer } = await supabaseAdmin.from("customers").select("*").eq("id", params.id).maybeSingle();
  if (!customer) return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });

  const { data: commissions } = await supabaseAdmin
    .from("commissions")
    .select("id, status")
    .eq("customer_id", customer.id);

  const hasPaidCommission = (commissions ?? []).some((c) => c.status === "paga");
  if (hasPaidCommission && !force) {
    return NextResponse.json(
      {
        error: "Já existe pagamento vinculado a esta indicação. Confirme novamente pra excluir mesmo assim.",
        hasPaidCommission: true,
      },
      { status: 409 }
    );
  }

  try {
    await supabaseAdmin.from("commissions").delete().eq("customer_id", customer.id);
    await supabaseAdmin.from("sales").delete().eq("customer_id", customer.id);
    const { error } = await supabaseAdmin.from("customers").delete().eq("id", customer.id);
    if (error) throw error;

    await logAudit(supabaseAdmin, {
      actorId: admin.userId,
      actorRole: "admin",
      action: "customer_deleted",
      entityType: "customer",
      entityId: customer.id,
      metadata: { partnerId: customer.partner_id, hadPaidCommission: hasPaidCommission },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao excluir cliente:", describeError(err));
    return NextResponse.json({ error: "Não foi possível excluir o registro." }, { status: 500 });
  }
}
