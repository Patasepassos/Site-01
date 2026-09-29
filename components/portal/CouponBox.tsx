"use client";

import { useState } from "react";

export default function CouponBox({ couponCode }: { couponCode: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://www.patasepassos.com.br/p/${couponCode.toLowerCase()}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ambiente sem permissão de clipboard — ignora silenciosamente
    }
  }

  function handleShare() {
    const message = `🐾 Conheça a Patas & Passos!\n\nUse meu cupom ${couponCode} e conheça nossos serviços para cuidar do seu pet com carinho, segurança e atenção.\n\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  return (
    <div className="portal-card">
      <h2>Seu cupom</h2>
      <div className="coupon-box" style={{ marginTop: 10 }}>
        <span className="code">{couponCode}</span>
        <span style={{ fontSize: 12, opacity: 0.8 }}>{copied ? "Copiado!" : "Exclusivo"}</span>
      </div>
      <div className="coupon-actions">
        <button type="button" className="btn btn-white" onClick={handleCopy}>
          {copied ? "✓ Copiado" : "Copiar cupom"}
        </button>
        <button type="button" className="btn btn-wa" onClick={handleShare}>
          Compartilhar
        </button>
      </div>
    </div>
  );
}
