"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PayoutStatus } from "@/lib/supabase/types";

const PAYMENT_METHODS = ["Pix", "Transferência bancária", "Outro"];

export default function PayoutActions({ payoutId, status }: { payoutId: string; status: PayoutStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

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

  function openConfirm() {
    // Gerada uma vez por tentativa de pagamento: se o clique falhar por
    // queda de conexão e o admin apertar de novo sem fechar o modal, a
    // mesma chave viaja de novo — o servidor trata como replay, nunca paga
    // duas vezes. Fechar e reabrir o modal conta como uma nova tentativa.
    setIdempotencyKey(crypto.randomUUID());
    setShowConfirm(true);
  }

  async function confirmPayment(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!proof) {
      setError("Anexe o comprovante de pagamento.");
      return;
    }
    if (!idempotencyKey) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.set("paymentMethod", paymentMethod);
      form.set("notes", notes);
      form.set("transactionReference", transactionReference);
      form.set("idempotencyKey", idempotencyKey);
      form.set("proof", proof);
      const res = await fetch(`/api/admin/saques/${payoutId}/pagar`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível confirmar o pagamento.");
        return;
      }
      setShowConfirm(false);
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
          <button type="button" className="btn btn-wa btn-sm" disabled={loading} onClick={openConfirm}>
            💰 Marcar como pago
          </button>
        )}
      </div>
      {!showConfirm && error && <p className="pf-error">{error}</p>}

      {showConfirm && (
        <div className="admin-modal-overlay" onClick={() => setShowConfirm(false)}>
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={confirmPayment}>
            <h3>Confirmar pagamento</h3>

            <label className="pf-label" htmlFor="pay-method">Forma de pagamento</label>
            <select
              id="pay-method"
              className="pf-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <label className="pf-label" htmlFor="pay-ref">Identificador da transação (opcional)</label>
            <input
              id="pay-ref"
              className="pf-input"
              value={transactionReference}
              onChange={(e) => setTransactionReference(e.target.value)}
              placeholder="Código do comprovante Pix, se tiver"
            />

            <label className="pf-label" htmlFor="pay-notes">Observação</label>
            <input
              id="pay-notes"
              className="pf-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opcional"
            />

            <label className="pf-label" htmlFor="pay-proof">📎 Anexar comprovante de pagamento</label>
            <input
              id="pay-proof"
              className="pf-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />

            {error && <p className="pf-error">{error}</p>}

            <div className="admin-modal-actions">
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setShowConfirm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-wa btn-sm" disabled={loading}>
                {loading ? "Confirmando…" : "Confirmar pagamento"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
