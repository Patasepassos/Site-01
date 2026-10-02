"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RankTierRow as RankTierRowType } from "@/lib/supabase/types";

export default function RankTierRow({ tier, canEditPhoto }: { tier: RankTierRowType; canEditPhoto: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [minClients, setMinClients] = useState(String(tier.min_clients));
  const [basePercentage, setBasePercentage] = useState(String(tier.base_percentage));
  const [recurringPercentage, setRecurringPercentage] = useState(String(tier.recurring_percentage));
  const [bonusText, setBonusText] = useState(tier.bonus_text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`/api/admin/ranks/${tier.id}/foto`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar a foto.");
        return;
      }
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function patchTier(payload: Record<string, unknown>) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ranks/${tier.id}`, {
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
        <div className="rr-id" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {tier.photo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={tier.photo_url} alt={tier.label} style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6 }} />
          ) : (
            <span>{tier.emoji}</span>
          )}
          {tier.label}
        </div>
        {canEditPhoto && (
          <label className="btn btn-white btn-sm" style={{ marginTop: 6, display: "inline-block", cursor: "pointer" }}>
            {uploadingPhoto ? "Enviando…" : "Trocar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              disabled={uploadingPhoto}
              onChange={handlePhotoChange}
            />
          </label>
        )}

        {editing ? (
          <div style={{ marginTop: 10, maxWidth: 320 }}>
            <label className="pf-label" htmlFor={`min-${tier.id}`}>Meta de clientes ativos</label>
            <input
              id={`min-${tier.id}`}
              className="pf-input"
              type="number"
              min="0"
              value={minClients}
              onChange={(e) => setMinClients(e.target.value)}
            />
            <div className="pf-row">
              <div>
                <label className="pf-label" htmlFor={`base-${tier.id}`}>Comissão base (%)</label>
                <input
                  id={`base-${tier.id}`}
                  className="pf-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={basePercentage}
                  onChange={(e) => setBasePercentage(e.target.value)}
                />
              </div>
              <div>
                <label className="pf-label" htmlFor={`rec-${tier.id}`}>Recorrência (%)</label>
                <input
                  id={`rec-${tier.id}`}
                  className="pf-input"
                  type="number"
                  min="0"
                  step="0.5"
                  value={recurringPercentage}
                  onChange={(e) => setRecurringPercentage(e.target.value)}
                />
              </div>
            </div>
            <label className="pf-label" htmlFor={`bonus-${tier.id}`}>Texto de benefício (vitrine)</label>
            <input
              id={`bonus-${tier.id}`}
              className="pf-input"
              value={bonusText}
              onChange={(e) => setBonusText(e.target.value)}
            />
            <div className="admin-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-wa btn-sm"
                disabled={loading}
                onClick={() =>
                  patchTier({
                    minClients: Number(minClients),
                    basePercentage: Number(basePercentage),
                    recurringPercentage: Number(recurringPercentage),
                    bonusText,
                  })
                }
              >
                Salvar
              </button>
              <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setEditing(false)}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ marginTop: 6, fontWeight: 700 }}>
              Meta: {tier.min_clients} clientes · {tier.base_percentage}% base + {tier.recurring_percentage}% recorrência
            </p>
            <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>{tier.bonus_text}</p>
          </>
        )}
        {error && <p className="pf-error">{error}</p>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        <span className={`status-pill ${tier.active ? "active" : "blocked"}`}>{tier.active ? "Ativo" : "Inativo"}</span>
        <div className="admin-actions">
          {!editing && (
            <button type="button" className="btn btn-white btn-sm" disabled={loading} onClick={() => setEditing(true)}>
              Editar
            </button>
          )}
          <button
            type="button"
            className={tier.active ? "btn btn-danger btn-sm" : "btn btn-wa btn-sm"}
            disabled={loading}
            onClick={() => patchTier({ active: !tier.active })}
          >
            {tier.active ? "Desativar" : "Ativar"}
          </button>
        </div>
      </div>
    </div>
  );
}
