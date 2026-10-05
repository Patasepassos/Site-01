"use client";

import { useState } from "react";

export default function ProofLink({ endpoint, label = "📎 Ver comprovante" }: { endpoint: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openProof() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Não foi possível abrir o comprovante.");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span>
      <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={openProof}>
        {loading ? "Abrindo…" : label}
      </button>
      {error && <p className="pf-error">{error}</p>}
    </span>
  );
}
