"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ServiceAreaNoteForm({ initialNote }: { initialNote: string }) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/configuracoes/area-atendimento", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível salvar.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="pf-label" htmlFor="service-area-note">Texto mostrado no painel do parceiro</label>
      <textarea
        id="service-area-note"
        className="pf-input"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <p className="pf-error">{error}</p>}
      {success && <p className="pf-success">Salvo!</p>}
      <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 12 }} disabled={loading}>
        {loading ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
