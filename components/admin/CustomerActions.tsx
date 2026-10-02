"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContractType, CustomerStatus, SaleRow } from "@/lib/supabase/types";

const QUICK_STATUSES: { value: CustomerStatus; label: string }[] = [
  { value: "em_contato", label: "Em contato" },
  { value: "em_negociacao", label: "Em negociação" },
  { value: "servico_contratado", label: "Serviço contratado" },
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
  sale,
}: {
  customerId: string;
  status: CustomerStatus;
  sale: SaleRow | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFechar, setShowFechar] = useState(false);
  const [amount, setAmount] = useState("");
  const [contractType, setContractType] = useState<ContractType>("avulso");

  async function post(url: string, body?: Record<string, unknown>, method?: "POST" | "PATCH") {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: method ?? (body ? "POST" : "PATCH"),
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir a ação.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Venda fechada com pagamento pendente: só falta confirmar (ou cancelar).
  if (status === "fechado" && sale && sale.payment_status === "pendente") {
    return (
      <div className="admin-actions" style={{ flexDirection: "column", alignItems: "flex-end" }}>
        <div className="admin-actions">
          <button
            type="button"
            className="btn btn-wa btn-sm"
            disabled={loading}
            onClick={() => post(`/api/admin/vendas/${sale.id}/confirmar-pagamento`, {})}
          >
            Confirmar pagamento
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={loading}
            onClick={() => post(`/api/admin/vendas/${sale.id}/cancelar`, {})}
          >
            Cancelar venda
          </button>
        </div>
        {error && <p className="pf-error">{error}</p>}
      </div>
    );
  }

  const isTerminal = status === "fechado" || status === "cancelado" || status === "nao_convertido";
  if (isTerminal) return null;

  async function handleFecharVenda(e: React.FormEvent) {
    e.preventDefault();
    const numericAmount = Number(amount.replace(",", "."));
    if (!numericAmount || numericAmount <= 0) {
      setError("Informe um valor de venda válido.");
      return;
    }
    await post(`/api/admin/clientes/${customerId}/fechar`, {
      amount: numericAmount,
      contractType,
    });
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
            if (e.target.value) post(`/api/admin/clientes/${customerId}/status`, { status: e.target.value }, "PATCH");
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
        <form onSubmit={handleFecharVenda} style={{ marginTop: 10, width: "100%", maxWidth: 280 }}>
          <label className="pf-label" htmlFor={`amount-${customerId}`}>Valor da venda (R$)</label>
          <input
            id={`amount-${customerId}`}
            className="pf-input"
            inputMode="decimal"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
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
          <p className="pf-hint">
            Mensal/Anual libera comissão recorrente pro parceiro a cada novo ciclo pago; Avulso gera só uma vez.
          </p>

          <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 10, width: "100%" }} disabled={loading}>
            {loading ? "Salvando…" : "Confirmar venda fechada"}
          </button>
        </form>
      )}

      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
