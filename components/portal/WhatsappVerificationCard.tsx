"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TwilioVerifyChannel } from "@/lib/sms/twilio";

const CHANNEL_LABEL: Record<TwilioVerifyChannel, string> = { sms: "SMS", whatsapp: "WhatsApp" };

export default function WhatsappVerificationCard({
  phone,
  verified,
  channel,
}: {
  phone: string;
  verified: boolean;
  channel: TwilioVerifyChannel;
}) {
  const router = useRouter();
  const channelLabel = CHANNEL_LABEL[channel];
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/whatsapp/enviar-codigo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar o código agora.");
        return;
      }
      setSent(true);
      setInfo(`Código enviado! Confira as mensagens de ${channelLabel} no seu telefone.`);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/whatsapp/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível verificar agora.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (verified) return null;

  if (!sent) {
    return (
      <div style={{ marginTop: 10 }}>
        <p style={{ fontSize: 13, marginBottom: 8 }}>
          Confirme seu telefone (<b>{phone}</b>) para liberar seus pagamentos.
        </p>
        <button type="button" className="pf-submit" style={{ width: "auto" }} disabled={loading} onClick={handleSend}>
          {loading ? "Enviando..." : `Enviar código por ${channelLabel}`}
        </button>
        {error && <p className="pf-error" style={{ marginTop: 8 }}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <p style={{ fontSize: 13, marginBottom: 8 }}>
        Enviamos um código por {channelLabel} para <b>{phone}</b>. Digite abaixo para confirmar.
      </p>
      <form onSubmit={handleVerify} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="pf-input"
          style={{ maxWidth: 140 }}
          inputMode="numeric"
          maxLength={10}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button className="pf-submit" type="submit" disabled={loading} style={{ width: "auto" }}>
          {loading ? "Verificando..." : "Verificar"}
        </button>
      </form>
      <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn btn-sm" disabled={loading} onClick={handleSend}>
          Reenviar código
        </button>
      </div>
      {error && <p className="pf-error" style={{ marginTop: 8 }}>{error}</p>}
      {info && <p className="pf-success" style={{ marginTop: 8 }}>{info}</p>}
    </div>
  );
}
