"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Counts = { partners: number; customers: number };

export default function RemoveTestDataButton() {
  const router = useRouter();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Counts | null>(null);

  async function openConfirm() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dados-teste");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível verificar os dados de teste.");
        return;
      }
      setCounts(data);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmRemoval() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dados-teste", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível remover os dados de teste.");
        return;
      }
      setResult(data.removed);
      setCounts(null);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={openConfirm}>
        🧹 Remover dados de teste
      </button>
      {error && <p className="pf-error">{error}</p>}
      {result && (
        <p className="pf-success">
          Removido: {result.partners} {result.partners === 1 ? "parceiro" : "parceiros"} de teste e{" "}
          {result.customers} {result.customers === 1 ? "cliente" : "clientes"} de teste.
        </p>
      )}

      {counts && (
        <div className="admin-modal-overlay" onClick={() => setCounts(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Atenção</h3>
            <p>Esta ação removerá os registros identificados como dados de teste:</p>
            <p style={{ fontWeight: 700 }}>
              {counts.partners} {counts.partners === 1 ? "parceiro" : "parceiros"} de teste ·{" "}
              {counts.customers} {counts.customers === 1 ? "cliente" : "clientes"} de teste
            </p>
            <p>Vendas reais, parceiros reais e pagamentos já registrados não são afetados.</p>
            <p>Deseja realmente remover os dados de teste?</p>
            {error && <p className="pf-error">{error}</p>}
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setCounts(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={confirmRemoval}>
                {loading ? "Removendo…" : "Remover testes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
