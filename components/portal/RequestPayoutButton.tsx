"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RequestPayoutButton({ disponivel }: { disponivel: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/saques", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível solicitar o saque.");
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
    <div>
      <button
        type="button"
        className="btn btn-wa btn-lg"
        style={{ width: "100%" }}
        disabled={loading || disponivel <= 0}
        onClick={handleRequest}
      >
        {loading ? "Solicitando…" : "Solicitar saque"}
      </button>
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
