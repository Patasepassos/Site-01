"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CommissionRuleRow } from "@/lib/supabase/types";

export default function RuleRow({ rule }: { rule: CommissionRuleRow }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [percentage, setPercentage] = useState(String(rule.percentage));
  const [minClients, setMinClients] = useState(String(rule.min_clients));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patchRule(payload: Record<string, unknown>) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/regras/${rule.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="referral-row" style={{ alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div className="rr-id">{rule.name}</div>
        <div className="rr-meta">
          {rule.service ?? "Todos os serviços"} · {rule.rule_type === "meta_clientes" ? "Meta de clientes" : "Recorrência"}
          {rule.recurring ? " · só recorrentes" : ""}
        </div>

        {editing ? (
          <div style={{ marginTop: 10, maxWidth: 260 }}>
            <label className="pf-label" htmlFor={`pct-${rule.id}`}>Comissão (%)</label>
            <input
              id={`pct-${rule.id}`}
              className="pf-input"
              type="number"
              min="0"
              step="0.5"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
            <label className="pf-label" htmlFor={`min-${rule.id}`}>Mínimo de clientes</label>
            <input
              id={`min-${rule.id}`}
              className="pf-input"
              type="number"
              min="1"
              value={minClients}
              onChange={(e) => setMinClients(e.target.value)}
            />
            <div className="admin-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-wa btn-sm"
                disabled={loading}
                onClick={() => patchRule({ percentage: Number(percentage), minClients: Number(minClients) })}
              >
                Salvar
              </button>
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 6, fontWeight: 700 }}>
            {rule.percentage}% · mínimo {rule.min_clients} {rule.min_clients === 1 ? "cliente" : "clientes"}
          </p>
        )}
        {error && <p className="pf-error">{error}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span className={`status-pill ${rule.active ? "active" : "blocked"}`}>{rule.active ? "Ativa" : "Inativa"}</span>
        <div className="admin-actions">
          {!editing && (
            <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setEditing(true)}>
              Editar
            </button>
          )}
          <button
            type="button"
            className={rule.active ? "btn btn-danger btn-sm" : "btn btn-wa btn-sm"}
            disabled={loading}
            onClick={() => patchRule({ active: !rule.active })}
          >
            {rule.active ? "Desativar" : "Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}
