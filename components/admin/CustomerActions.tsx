"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContractType, CustomerStatus, SaleRow } from "@/lib/supabase/types";

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

const PAYMENT_METHODS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Outro"];

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
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [contractType, setContractType] = useState<ContractType>("avulso");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState("");

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
      customerName,
      customerPhone,
      amount: numericAmount,
      contractType,
      paymentMethod,
      notes,
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
            if (e.target.value) post(`/api/admin/clientes/${customerId}/status`, { status: e.target.value });
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
          <label className="pf-label" htmlFor={`name-${customerId}`}>Nome do cliente</label>
          <input
            id={`name-${customerId}`}
            className="pf-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nome completo"
          />

          <label className="pf-label" htmlFor={`phone-${customerId}`}>WhatsApp do cliente</label>
          <input
            id={`phone-${customerId}`}
            className="pf-input"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="(11) 91234-5678"
          />

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

          <label className="pf-label" htmlFor={`payment-${customerId}`}>Forma de pagamento</label>
          <select
            id={`payment-${customerId}`}
            className="pf-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>

          <label className="pf-label" htmlFor={`notes-${customerId}`}>Observações</label>
          <input
            id={`notes-${customerId}`}
            className="pf-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Opcional"
          />

          <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 10, width: "100%" }} disabled={loading}>
            {loading ? "Salvando…" : "Confirmar venda fechada"}
          </button>
        </form>
      )}

      {error && <p className="pf-error">{error}</p>}
    </div>
  );
}
