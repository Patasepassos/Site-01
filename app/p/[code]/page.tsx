import type { Metadata } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SERVICE_LABELS, SERVICE_PATHS } from "@/lib/partners/labels";
import type { ServiceKey } from "@/lib/supabase/types";
import CouponLanding from "@/components/CouponLanding";

export const metadata: Metadata = {
  title: "Seu cupom · Patas & Passos",
  robots: { index: false, follow: false },
};

function sanitizeCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .slice(0, 20)
    .replace(/[^A-Z0-9]/g, "");
}

function isServiceKey(value: string): value is ServiceKey {
  return value in SERVICE_LABELS;
}

/**
 * Landing real do cupom (/p/{cupom}?s={servico}) -- antes era só um redirect
 * instantâneo pro WhatsApp. Agora o cupom é validado contra o parceiro de
 * verdade (tem que existir e estar ativo) e o cliente vê e "aplica" o
 * benefício antes de seguir pra contratação via WhatsApp, em vez de só um
 * botão genérico "Conheça o serviço".
 *
 * Não cria nenhum registro em `customers` aqui -- a indicação continua sendo
 * confirmada pelo parceiro (botão "Indiquei um cliente") ou pelo admin, como
 * sempre foi. Essa página só identifica cupom + serviço e leva o cliente
 * adiante com os dois já associados (via URL e cookie), sem exigir que ele
 * digite o código de novo.
 */
export default async function CupomPage({
  params,
  searchParams,
}: {
  params: { code: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const code = sanitizeCode(params.code);
  const rawService = typeof searchParams.s === "string" ? searchParams.s : null;
  const serviceKey = rawService && isServiceKey(rawService) ? rawService : null;

  let valid = false;
  if (code) {
    const supabaseAdmin = createSupabaseAdminClient();
    // Leitura pública mínima: só confirma existência + status do cupom.
    // Nunca expõe nome, telefone ou qualquer outro dado do parceiro aqui.
    const { data } = await supabaseAdmin
      .from("partners")
      .select("status, account_deleted_at")
      .eq("coupon_code", code)
      .maybeSingle();
    valid = Boolean(data) && data!.status === "active" && !data!.account_deleted_at;
  }

  return (
    <CouponLanding
      code={code}
      valid={valid}
      serviceKey={serviceKey}
      serviceLabel={serviceKey ? SERVICE_LABELS[serviceKey] : null}
      servicePath={serviceKey ? SERVICE_PATHS[serviceKey] : null}
    />
  );
}
