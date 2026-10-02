"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/partners/labels";
import type { ServiceKey } from "@/lib/supabase/types";

export default function AddReferralForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<ServiceKey>(SERVICE_KEYS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/indicacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, service }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível registrar a indicação.");
        return;
      }
      setSuccess(`${data.label} registrado! Vamos entrar em contato com o cliente.`);
      setFullName("");
      setPhone("");
      setService(SERVICE_KEYS[0]);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="btn btn-wa btn-sm" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
        + Indiquei um cliente
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 18, maxWidth: 360 }}>
      <label className="pf-label" htmlFor="ref-name">Nome do cliente</label>
      <input
        id="ref-name"
        className="pf-input"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Nome completo"
        required
      />

      <label className="pf-label" htmlFor="ref-phone">WhatsApp do cliente</label>
      <input
        id="ref-phone"
        className="pf-input"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(11) 91234-5678"
        required
      />

      <label className="pf-label" htmlFor="ref-service">Serviço de interesse</label>
      <select
        id="ref-service"
        className="pf-select"
        value={service}
        onChange={(e) => setService(e.target.value as ServiceKey)}
      >
        {SERVICE_KEYS.map((key) => (
          <option key={key} value={key}>{SERVICE_LABELS[key]}</option>
        ))}
      </select>

      {error && <p className="pf-error">{error}</p>}
      {success && <p className="pf-success">{success}</p>}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button type="submit" className="btn btn-wa btn-sm" disabled={loading}>
          {loading ? "Enviando…" : "Registrar indicação"}
        </button>
        <button type="button" className="btn btn-sm" disabled={loading} onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
