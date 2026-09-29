"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContractType, CustomerStatus } from "@/lib/supabase/types";

const QUICK_STATUSES: { value: CustomerStatus; label: string }[] = [
  { value: "em_contato", label: "Em contato" },
  { value: "em_negociacao", label: "Em negociação" },
  { value: "cancelado", label: "Cancelado" },
  { value: "nao_convertido", label: "Não convertido" },
];

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: "avulso", label: "Avulso" },
  { value: "mensal", label: "Mensal (recorrente)" },
  { value: "anual", label: "Anual (recorrente)" },
];

export default function CustomerActions({
  customerId,
  status,
}: {
  customerId: string;
  status: CustomerStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFechar, setShowFechar] = useState(false);
  const [amount, setAmount] = useState("");
  const [contractType, setContractType] = useState<ContractType>("avulso");

  const isTerminal = status === "fechado" || status === "cancelado" || status === "nao_convertido";
  if (isTerminal) return null;

  async function updateStatus(next: CustomerStatus) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clientes/${customerId}/status`, {
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

  async function handleFecharVenda(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      setError("Informe um valor de venda válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clientes/${customerId}/fechar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numericAmount, contractType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível fechar a venda.");
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
    <div className="admin-actions" style={{ flexDirection: "column", alignItems: "flex-end" }}>
      <div className="admin-actions">
        <select
          className="pf-select"
          style={{ width: "auto", padding: "8px 12px", fontSize: 13 }}
          value=""
          disabled={loading}
          onChange={(e) => {
            if (e.target.value) updateStatus(e.target.value as CustomerStatus);
          }}
        >
          <option value="" disabled>Mover para…</option>
          {QUICK_STATUSES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={() => setShowFechar((v) => !v)}>
          Fechar venda
        </button>
      </div>

      {showFechar && (
        <form onSubmit={handleFecharVenda} style={{ marginTop: 10, width: "100%", maxWidth: 260 }}>
          <label className="pf-label" htmlFor={`amount-${customerId}`}>Valor da venda (R$)</label>
          <input
            id={`amount-${customerId}`}
            className="pf-input"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <label className="pf-label" htmlFor={`contract-${customerId}`}>Tipo de contrato</label>
          <select
            id={`contract-${customerId}`}
            className="pf-select"
            value={contractType}
            onChange={(e) => setContractType(e.target.value as ContractType)}
          >
            {CONTRACT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 10, width: "100%" }} disabled={loading}>
            {loading ? "Salvando…" : "Confirmar venda fechada"}
          </button>
        </form>
      )}

      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
