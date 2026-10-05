"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CONFIRM_PHRASE = "REMOVER PARCEIRO";

/**
 * Só aparece pra admin chefe (is_owner) -- página que renderiza isso decide
 * quando passar o componente. Exige digitar a mesma frase da autoexclusão
 * do próprio parceiro, porque aqui é o admin removendo a conta de outra
 * pessoa: anonimiza os dados e bane o login, mas preserva o histórico
 * financeiro (igual à autoexclusão em /parceiros/perfil).
 */
export default function RemovePartnerButton({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parceiros/${partnerId}/remover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: typed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível remover.");
        return;
      }
      router.refresh();
      setConfirming(false);
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>
        🗑️ Remover parceiro
      </button>

      {confirming && (
        <div className="admin-modal-overlay" onClick={() => !loading && setConfirming(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Remover este parceiro?</h3>
            <p>
              Isso bane o login dessa conta e anonimiza nome, CPF/CNPJ e chave Pix — o histórico de indicações e
              comissões já geradas é mantido. Não tem como desfazer pelo painel depois.
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              Digite <b>{CONFIRM_PHRASE}</b> para confirmar.
            </p>
            <input
              className="pf-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              autoFocus
            />
            {error && <p className="pf-error">{error}</p>}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-white btn-sm"
                disabled={loading}
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                  setError(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={loading || typed !== CONFIRM_PHRASE}
                onClick={handleRemove}
              >
                {loading ? "Removendo…" : "Remover parceiro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
