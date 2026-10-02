"use client";

import { useState } from "react";
import type { PixKeyType } from "@/lib/supabase/types";

const PIX_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  telefone: "Telefone",
  aleatoria: "Chave aleatória",
};

export default function PixKeyReveal({
  partnerId,
  pixKeyType,
  pixKeyMasked,
}: {
  partnerId: string;
  pixKeyType: PixKeyType;
  pixKeyMasked: string;
}) {
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function fetchPixKey(action: "view" | "copy"): Promise<string | null> {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parceiros/${partnerId}/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível carregar a chave.");
        return null;
      }
      return typeof data.pixKey === "string" ? data.pixKey : null;
    } catch {
      setError("Falha de conexão. Tente novamente.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleShow() {
    if (revealedKey) {
      setRevealedKey(null);
      return;
    }
    const key = await fetchPixKey("view");
    if (key) setRevealedKey(key);
  }

  async function handleCopy() {
    setCopied(false);
    const key = revealedKey ?? (await fetchPixKey("copy"));
    if (!key) return;
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Não foi possível copiar. Copie manualmente.");
    }
  }

  return (
    <div style={{ marginTop: 4 }}>
      <p style={{ marginTop: 6 }}>Tipo de chave: {PIX_LABELS[pixKeyType]}</p>
      <p>
        Chave Pix: <b>{revealedKey ?? pixKeyMasked}</b>
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <button type="button" className="btn btn-sm" disabled={loading} onClick={handleShow}>
          {loading && !revealedKey ? "Carregando…" : revealedKey ? "🙈 Ocultar chave Pix" : "👁 Mostrar chave Pix"}
        </button>
        <button type="button" className="btn btn-sm" disabled={loading} onClick={handleCopy}>
          {copied ? "Copiado!" : "📋 Copiar chave Pix"}
        </button>
      </div>
      {error && <p className="pf-error" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
}
