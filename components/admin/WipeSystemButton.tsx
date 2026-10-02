"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Counts = {
  partners: number;
  customers: number;
  sales: number;
  commissions: number;
  payouts: number;
  realPaidPayouts: number;
  testRecords: number;
};

const CONFIRM_PHRASE = "ZERAR PATAS";

export default function WipeSystemButton() {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [realPaymentsWarning, setRealPaymentsWarning] = useState(false);
  const [acceptRealPayments, setAcceptRealPayments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function reset() {
    setStep(0);
    setConfirmText("");
    setRealPaymentsWarning(false);
    setAcceptRealPayments(false);
    setError(null);
  }

  async function startFlow() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sistema/zerar");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível carregar os dados.");
        return;
      }
      setCounts(data);
      setStep(1);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function executeWipe() {
    if (confirmText !== CONFIRM_PHRASE) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sistema/zerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText, confirmRealPayments: acceptRealPayments }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsRealPaymentsConfirm) {
          setRealPaymentsWarning(true);
          setError(data.error);
          return;
        }
        setError(data.error ?? "Não foi possível zerar o sistema.");
        return;
      }
      setDone(true);
      reset();
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-danger btn-sm" disabled={loading} onClick={startFlow}>
        ⚠️ Zerar dados
      </button>
      {!step && error && <p className="pf-error">{error}</p>}
      {done && <p className="pf-success">Sistema zerado com sucesso.</p>}

      {step === 1 && counts && (
        <div className="admin-modal-overlay" onClick={reset}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Zerar todos os dados</h3>
            <p>Esta ação poderá remover indicações, vendas, metas e comissões do painel.</p>
            <p>Essa ação é destinada para reinicialização do sistema/testes.</p>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-white btn-sm" onClick={reset}>Cancelar</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setStep(2)}>Continuar</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && counts && (
        <div className="admin-modal-overlay" onClick={reset}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Isso vai apagar:</h3>
            <ul style={{ margin: "0 0 10px", paddingLeft: 20, fontSize: 14, color: "var(--ink-soft)" }}>
              <li>{counts.partners} parceiros</li>
              <li>{counts.customers} indicações</li>
              <li>{counts.sales} vendas</li>
              <li>{counts.commissions} comissões</li>
              <li>{counts.payouts} saques</li>
              <li>{counts.testRecords} registros de teste (incluídos acima)</li>
            </ul>
            <p>A meta de todos os parceiros é reiniciada junto (ela depende das indicações fechadas).</p>
            {counts.realPaidPayouts > 0 && (
              <p className="admin-modal-danger">
                ⚠️ {counts.realPaidPayouts} desses saques já foram pagos de verdade. O histórico financeiro real
                será afetado.
              </p>
            )}
            <p style={{ fontWeight: 700 }}>Tem certeza que deseja continuar?</p>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-white btn-sm" onClick={() => setStep(1)}>Voltar</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => setStep(3)}>Sim, quero zerar</button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="admin-modal-overlay" onClick={reset}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Última confirmação</h3>
            <p>
              Digite <b>{CONFIRM_PHRASE}</b> pra liberar o botão de zerar o sistema.
            </p>
            <input
              className="pf-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoFocus
            />

            {realPaymentsWarning && (
              <>
                <p className="admin-modal-danger">{error}</p>
                <label className="pf-check">
                  <input
                    type="checkbox"
                    checked={acceptRealPayments}
                    onChange={(e) => setAcceptRealPayments(e.target.checked)}
                  />
                  Entendo o risco e quero remover mesmo assim, incluindo os pagamentos reais.
                </label>
              </>
            )}
            {!realPaymentsWarning && error && <p className="pf-error">{error}</p>}

            <div className="admin-modal-actions">
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={reset}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={loading || confirmText !== CONFIRM_PHRASE || (realPaymentsWarning && !acceptRealPayments)}
                onClick={executeWipe}
              >
                {loading ? "Zerando…" : "Zerar sistema"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
