"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/partners/labels";
import type { CommissionRuleType, ServiceKey } from "@/lib/supabase/types";

const RULE_TYPES: { value: CommissionRuleType; label: string }[] = [
  { value: "meta_clientes", label: "Meta de clientes" },
  { value: "recorrencia", label: "Recorrência" },
];

export default function NewRuleForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [service, setService] = useState<ServiceKey | "">("");
  const [ruleType, setRuleType] = useState<CommissionRuleType>("meta_clientes");
  const [percentage, setPercentage] = useState("5");
  const [minClients, setMinClients] = useState("5");
  const [recurring, setRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Dê um nome para a regra.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/regras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          service: service || null,
          ruleType,
          percentage: Number(percentage),
          minClients: Number(minClients),
          recurring,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível criar a regra.");
        return;
      }
      setName("");
      setService("");
      setPercentage("5");
      setMinClients("5");
      setRecurring(false);
      router.refresh();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="pf-label" htmlFor="rule-name">Nome da regra</label>
      <input
        id="rule-name"
        className="pf-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Meta de 5 clientes"
      />

      <label className="pf-label" htmlFor="rule-service">Serviço</label>
      <select id="rule-service" className="pf-select" value={service} onChange={(e) => setService(e.target.value as ServiceKey | "")}>
        <option value="">Todos os serviços</option>
        {SERVICE_KEYS.map((key) => (
          <option key={key} value={key}>{SERVICE_LABELS[key]}</option>
        ))}
      </select>

      <div className="pf-row">
        <div>
          <label className="pf-label" htmlFor="rule-type">Tipo</label>
          <select id="rule-type" className="pf-select" value={ruleType} onChange={(e) => setRuleType(e.target.value as CommissionRuleType)}>
            {RULE_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="pf-label" htmlFor="rule-percentage">Comissão (%)</label>
          <input
            id="rule-percentage"
            className="pf-input"
            type="number"
            min="0"
            step="0.5"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
          />
        </div>
      </div>

      <label className="pf-label" htmlFor="rule-min-clients">Mínimo de clientes</label>
      <input
        id="rule-min-clients"
        className="pf-input"
        type="number"
        min="1"
        value={minClients}
        onChange={(e) => setMinClients(e.target.value)}
      />

      <label className="pf-check">
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        Considerar só clientes recorrentes (contrato mensal ou anual)
      </label>

      {error && <p className="pf-error">{error}</p>}

      <button type="submit" className="btn btn-wa btn-sm" style={{ marginTop: 16 }} disabled={loading}>
        {loading ? "Criando…" : "Criar regra"}
      </button>
    </form>
  );
}
