"use client";

import { formatBRL, formatDate } from "@/lib/partners/labels";

/**
 * Links de WhatsApp (wa.me/api.whatsapp.com) não suportam anexar arquivo —
 * só abrem a conversa com uma mensagem pronta. O comprovante em si precisa
 * ser anexado manualmente pelo admin (por isso o ProofLink ao lado, pra
 * baixar o arquivo e arrastar pra conversa).
 */
function waLinkTo(phoneDigits: string, message: string): string {
  const withCountryCode = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;
  return `https://api.whatsapp.com/send?phone=${withCountryCode}&text=${encodeURIComponent(message)}`;
}

export default function SendReceiptButton({
  partnerPhone,
  amount,
  paidAt,
}: {
  partnerPhone: string;
  amount: number;
  paidAt: string;
}) {
  const message = `Olá! 😊\nSeu pagamento referente à comissão da indicação foi realizado.\n💰 Valor: ${formatBRL(amount)}\n📅 Data: ${formatDate(paidAt)}\n✅ Status: Pago\nEstamos enviando o comprovante referente ao pagamento.`;

  return (
    <a
      className="btn btn-wa btn-sm"
      href={waLinkTo(partnerPhone, message)}
      target="_blank"
      rel="noopener noreferrer"
    >
      📤 Enviar comprovante
    </a>
  );
}
