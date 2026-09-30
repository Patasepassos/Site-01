"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CpfVerifyRetryButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parceiros/cpf/verificar", { method: "POST" });
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

  return (
    <div style={{ marginTop: 8 }}>
      <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={retry}>
        {loading ? "Verificando…" : "Tentar verificar novamente"}
      </button>
      {error && <p className="pf-error" style={{ marginTop: 6 }}>{error}</p>}
    </div>
  );
}
