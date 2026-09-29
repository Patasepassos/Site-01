"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PayoutStatus } from "@/lib/supabase/types";

export default function PayoutActions({ payoutId, status }: { payoutId: string; status: PayoutStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(next: PayoutStatus) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/saques/${payoutId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível atualizar o saque.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "pago" || status === "recusado") return null;

  return (
    <div>
      <div className="admin-actions">
        {status === "solicitado" && (
          <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => updateStatus("em_analise")}>
            Em análise
          </button>
        )}
        {(status === "solicitado" || status === "em_analise") && (
          <>
            <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={() => updateStatus("aprovado")}>
              Aprovar
            </button>
            <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => updateStatus("recusado")}>
              Recusar
            </button>
          </>
        )}
        {status === "aprovado" && (
          <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={() => updateStatus("pago")}>
            Marcar como pago
          </button>
        )}
      </div>
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
