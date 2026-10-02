"use client";

import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/partners/labels";
import { playClickSound } from "@/lib/portal/sound";
import { useToast } from "./ToastProvider";

const CARD_TONES = ["tone-a", "tone-b", "tone-c", "tone-d", "tone-e", "tone-f"];

export default function ServiceShareCards({ couponCode }: { couponCode: string }) {
  const showToast = useToast();

  async function handleCopy(label: string) {
    try {
      await navigator.clipboard.writeText(couponCode);
    } catch {
      // ambiente sem permissão de clipboard — ignora silenciosamente
    }
    playClickSound();
    showToast(`Cupom copiado! Use em ${label}.`);
  }

  function handleShare(label: string, key: string) {
    // O link leva pra /p/{cupom}?s={serviço} -- que redireciona quem clicar
    // direto pro WhatsApp oficial com o cupom e o serviço já preenchidos,
    // em vez de abrir uma página do site.
    const shareUrl = `https://www.patasepassos.com.br/p/${couponCode.toLowerCase()}?s=${key}`;
    const message = `Uma parceria que eu precisava compartilhar com vocês. 🐾💛\n\nA *Patas & Passos* cuida dos nossos pets com muito carinho, enquanto eles aproveitam o dia, gastam energia e se divertem.\n\nE tem um presente para vocês: usando meu cupom *${couponCode}* na hora de agendar, você garante uma condição especial. 🐶✨\n\n${shareUrl}`;
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
              <button type="button" className="btn-copy btn-copy-ghost" onClick={() => handleShare(label, key)}>
                💬 WhatsApp
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
