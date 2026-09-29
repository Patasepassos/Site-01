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
            <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => updateStatus("blocked")}>
              Recusar
            </button>
          </>
        )}
        {status === "active" && (
          <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={() => updateStatus("blocked")}>
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
    </div>
  );
}
