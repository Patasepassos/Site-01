"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditNameForm({ initialFullName }: { initialFullName: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/nome", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
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

  if (!editing) {
    return (
      <button type="button" className="btn btn-sm" style={{ marginTop: 6 }} onClick={() => setEditing(true)}>
        Corrigir nome
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
      <label className="pf-label" htmlFor="fullName">Nome completo</label>
      <input
        id="fullName"
        className="pf-input"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        minLength={3}
      />
      <p className="pf-hint">
        Use seu nome completo real, exatamente como consta no seu CPF. Um nome diferente do CPF faz a verificação
        falhar.
      </p>
      {error && <p className="pf-error">{error}</p>}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button className="pf-submit" type="submit" disabled={loading} style={{ width: "auto" }}>
          {loading ? "Salvando…" : "Salvar nome"}
        </button>
        <button
          type="button"
          className="btn btn-sm"
          disabled={loading}
          onClick={() => {
            setEditing(false);
            setFullName(initialFullName);
            setError(null);
          }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
