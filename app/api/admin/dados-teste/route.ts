import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/admin/guard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getTestDataCounts, removeTestData } from "@/lib/admin/test-data";
import { describeError } from "@/lib/partners/errors";

export async function GET() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const counts = await getTestDataCounts(createSupabaseAdminClient());
  return NextResponse.json(counts);
}

export async function DELETE() {
  const admin = await requireAdminUser();
  if (!admin) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  try {
    const removed = await removeTestData(createSupabaseAdminClient(), admin.userId);
    return NextResponse.json({ success: true, removed });
  } catch (err) {
    console.error("Erro ao remover dados de teste:", describeError(err));
    return NextResponse.json({ error: "Não foi possível remover os dados de teste." }, { status: 500 });
  }
}
