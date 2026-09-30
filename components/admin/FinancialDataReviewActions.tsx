"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FinancialDataStatus } from "@/lib/supabase/types";

export default function FinancialDataReviewActions({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  async function review(next: FinancialDataStatus, reviewNote: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parceiros/${partnerId}/dados-financeiros`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, note: reviewNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível atualizar.");
        return;
      }
      setRejecting(false);
      setNote("");
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (rejecting) {
    return (
      <div style={{ marginTop: 8 }}>
        <label className="pf-label" htmlFor="financialNote">
          Motivo da correção necessária
        </label>
        <textarea
          id="financialNote"
          className="pf-input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />
        {error && <p className="pf-error">{error}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={loading || note.trim().length < 3}
            onClick={() => review("rejected", note)}
          >
            {loading ? "Enviando…" : "Solicitar correção"}
          </button>
          <button
            type="button"
            className="btn btn-sm"
            disabled={loading}
            onClick={() => {
              setRejecting(false);
              setNote("");
              setError(null);
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div className="admin-actions">
        <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={() => review("approved", "")}>
          Aprovar dados financeiros
        </button>
        <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => setRejecting(true)}>
          Solicitar correção
        </button>
      </div>
      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
