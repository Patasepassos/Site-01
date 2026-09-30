"use client";

import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/partners/labels";
import { playClickSound } from "@/lib/portal/sound";
import { useToast } from "./ToastProvider";

const CARD_TONES = ["tone-a", "tone-b", "tone-c", "tone-d", "tone-e", "tone-f"];

export default function ServiceShareCards({ couponCode }: { couponCode: string }) {
  const showToast = useToast();
  const shareUrl = `https://www.patasepassos.com.br/p/${couponCode.toLowerCase()}`;

  async function handleCopy(label: string) {
    try {
      await navigator.clipboard.writeText(couponCode);
    } catch {
      // ambiente sem permissão de clipboard — ignora silenciosamente
    }
    playClickSound();
    showToast(`Cupom copiado! Use em ${label}.`);
  }

  function handleShare(label: string) {
    const message = `🐾 Conheça a Patas & Passos!\n\nUse meu cupom ${couponCode} em ${label} e ganhe cuidado de verdade pro seu pet.\n\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  return (
    <div className="share-cards-grid">
      {SERVICE_KEYS.map((key, i) => {
        const label = SERVICE_LABELS[key];
        return (
          <div className={`share-card ${CARD_TONES[i % CARD_TONES.length]}`} key={key}>
            <div className="share-card-icon">{label.split(" ")[0]}</div>
            <div className="share-card-name">{label.replace(/^\S+\s/, "")}</div>
            <div className="share-card-actions">
              <button type="button" className="btn-copy" onClick={() => handleCopy(label)}>
                📋 Copiar cupom
              </button>
              <button type="button" className="btn-copy btn-copy-ghost" onClick={() => handleShare(label)}>
                💬 WhatsApp
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
