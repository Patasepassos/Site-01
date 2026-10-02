"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CustomerRowMenu({
  customerId,
  isTest,
  isArchived,
  canDelete,
}: {
  customerId: string;
  isTest: boolean;
  isArchived: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [needsForce, setNeedsForce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleTest() {
    setLoading(true);
    try {
      await fetch(`/api/admin/clientes/${customerId}/marcar-teste`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTest: !isTest }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  async function toggleArchive() {
    setLoading(true);
    try {
      await fetch(`/api/admin/clientes/${customerId}/arquivar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !isArchived }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  async function handleDelete(force: boolean) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clientes/${customerId}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.hasPaidCommission) {
          setNeedsForce(true);
          setError(data.error);
          return;
        }
        setError(data.error ?? "Não foi possível excluir.");
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
    <div className="admin-menu">
      <button type="button" className="admin-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Mais ações">
        ⋮
      </button>

      {open && !confirmDelete && (
        <div className="admin-menu-list">
          <button type="button" disabled={loading} onClick={toggleTest}>
            {isTest ? "Desmarcar teste" : "Marcar como teste"}
          </button>
          <button type="button" disabled={loading} onClick={toggleArchive}>
            {isArchived ? "📦 Desarquivar" : "📦 Arquivar"}
          </button>
          {canDelete && (
            <button type="button" className="danger" disabled={loading} onClick={() => setConfirmDelete(true)}>
              Excluir
            </button>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Excluir este registro?</h3>
            <p>Essa ação removerá esta indicação/venda do painel.</p>
            {needsForce && <p className="admin-modal-danger">{error}</p>}
            {!needsForce && error && <p className="pf-error">{error}</p>}
            <div className="admin-modal-actions">
              <button
                type="button"
                className="btn btn-white btn-sm"
                disabled={loading}
                onClick={() => {
                  setConfirmDelete(false);
                  setOpen(false);
                  setNeedsForce(false);
                  setError(null);
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={loading}
                onClick={() => handleDelete(needsForce)}
              >
                {loading ? "Excluindo…" : needsForce ? "Excluir mesmo assim" : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
