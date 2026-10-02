import { NextResponse } from "next/server";
import { waLink, waMessages } from "@/lib/site";
import { SERVICE_LABELS } from "@/lib/partners/labels";
import type { ServiceKey } from "@/lib/supabase/types";

/**
 * Link curto de cupom que o parceiro compartilha (/p/{cupom}) -- nunca foi
 * uma página de verdade, por isso caía no 404 do site. Esse link existe só
 * pra abrir direto o WhatsApp oficial com uma mensagem já preenchida citando
 * o cupom (e o serviço, quando ?s= vem de ServiceShareCards), em vez de
 * pousar o cliente indicado numa página genérica do site.
 */
export async function GET(request: Request, { params }: { params: { code: string } }) {
  const code = params.code
    .trim()
    .toUpperCase()
    .slice(0, 20)
    .replace(/[^A-Z0-9]/g, "");

  const serviceKey = new URL(request.url).searchParams.get("s") as ServiceKey | null;
  const serviceLabel = serviceKey && SERVICE_LABELS[serviceKey] ? SERVICE_LABELS[serviceKey].replace(/^\S+\s/, "") : null;

  const message = !code
    ? waMessages.default
    : serviceLabel
      ? `Olá! 🐾 Fui indicado(a) pelo cupom ${code} e estou interessado(a) em ${serviceLabel}.`
      : `Olá! 🐾 Fui indicado(a) pelo cupom ${code} e estou interessado(a) em conhecer os serviços da Patas & Passos.`;

  return NextResponse.redirect(waLink(message), 302);
}
