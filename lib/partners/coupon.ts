import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

function slugifyName(fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] ?? "PARCEIRO";
  const ascii = firstName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();
  return (ascii || "PARCEIRO").slice(0, 12);
}

/** Gera um cupom único (ex: JOAO10), checando colisão no banco. */
export async function generateUniqueCoupon(
  supabase: SupabaseClient<Database>,
  fullName: string
): Promise<string> {
  const base = slugifyName(fullName);

  for (let attempt = 0; attempt < 25; attempt++) {
    const suffix = attempt === 0 ? "10" : String(Math.floor(10 + Math.random() * 90));
    const candidate = `${base}${suffix}`;

    const { data, error } = await supabase
      .from("partners")
      .select("id")
      .eq("coupon_code", candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data) return candidate;
  }

  throw new Error("Não foi possível gerar um cupom único. Tente novamente.");
}
