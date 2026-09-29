"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/partners/labels";
import type { ServiceKey } from "@/lib/supabase/types";

export default function AddCustomerForm({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [service, setService] = useState<ServiceKey>(SERVICE_KEYS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/parceiros/${partnerId}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível adicionar o cliente.");
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
    <form onSubmit={handleSubmit}>
      <label className="pf-label" htmlFor="service">Serviço indicado</label>
      <select
        id="service"
        className="pf-select"
        value={service}
        onChange={(e) => setService(e.target.value as ServiceKey)}
      >
        {SERVICE_KEYS.map((key) => (
          <option key={key} value={key}>{SERVICE_LABELS[key]}</option>
        ))}
      </select>
      {error && <p className="pf-error">{error}</p>}
      <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 14 }} disabled={loading}>
        {loading ? "Adicionando…" : "Adicionar cliente indicado"}
      </button>
    </form>
  );
}
