"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PartnerStatus } from "@/lib/supabase/types";

export default function PartnerStatusActions({
  partnerId,
  status,
}: {
  partnerId: string;
  status: PartnerStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bloquear/recusar tranca o portal do parceiro na hora -- ação de impacto
  // real, então (diferente de Aprovar/Reativar) exige confirmação explícita
  // em vez de disparar direto no clique.
  const [confirming, setConfirming] = useState<"blocked" | null>(null);

  async function updateStatus(next: PartnerStatus) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parceiros/${partnerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível atualizar.");
        return;
      }
      setConfirming(null);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="admin-actions">
        {status === "pending" && (
          <>
            <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={() => updateStatus("active")}>
              Aprovar
            </button>
            <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => setConfirming("blocked")}>
              Recusar
            </button>
          </>
        )}
        {status === "active" && (
          <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => setConfirming("blocked")}>
            Bloquear
          </button>
        )}
        {status === "blocked" && (
          <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={() => updateStatus("active")}>
            Reativar
          </button>
        )}
      </div>
      {error && <p className="pf-error">{error}</p>}

      {confirming && (
        <div className="admin-modal-overlay" onClick={() => !loading && setConfirming(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ {status === "pending" ? "Recusar este parceiro?" : "Bloquear este parceiro?"}</h3>
            <p>
              {status === "pending"
                ? "O cadastro não será aprovado e a pessoa é avisada por e-mail. Você pode reverter depois em \"Reativar\"."
                : "O acesso ao Portal do Parceiro é bloqueado imediatamente e a pessoa é avisada por e-mail. Você pode reverter depois em \"Reativar\"."}
            </p>
            {error && <p className="pf-error">{error}</p>}
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setConfirming(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={loading}
                onClick={() => updateStatus("blocked")}
              >
                {loading ? "Bloqueando…" : status === "pending" ? "Recusar" : "Bloquear"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
