"use client";

import { useMemo, useState } from "react";
import { SERVICE_KEYS, SERVICE_LABELS } from "@/lib/partners/labels";
import type { ServiceKey } from "@/lib/supabase/types";

type RulePreview = {
  id: string;
  name: string;
  service: ServiceKey | null;
  rule_type: "meta_clientes" | "recorrencia";
  percentage: number;
  min_clients: number;
  recurring: boolean;
};

/**
 * Calculadora de comissão do afiliado -- simula o MESMO critério usado de
 * verdade em lib/partners/commission-engine.ts (recalculatePartnerCommissions):
 * uma venda pode se qualificar em várias regras ativas ao mesmo tempo (uma
 * base + um bônus de meta, por exemplo), e cada uma gera sua própria parcela
 * de comissão, somadas aqui como "total estimado". Nunca mostra custo, margem
 * ou faturamento da empresa -- só o valor da venda informado e a remuneração
 * que cabe ao afiliado.
 */
export default function CommissionCalculator({ rules }: { rules: RulePreview[] }) {
  const [service, setService] = useState<ServiceKey>(SERVICE_KEYS[0]);
  const [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState("");

  const amountNumber = Number(amount.replace(",", ".")) || 0;

  const matches = useMemo(
    () =>
      rules.filter((r) => (r.service === null || r.service === service) && (!r.recurring || recurring)),
    [rules, service, recurring]
  );

  const total = matches.reduce((sum, r) => sum + amountNumber * (r.percentage / 100), 0);

  return (
    <div style={{ maxWidth: 480 }}>
      <label className="pf-label" htmlFor="calc-service">Serviço</label>
      <select
        id="calc-service"
        className="pf-select"
        value={service}
        onChange={(e) => setService(e.target.value as ServiceKey)}
      >
        {SERVICE_KEYS.map((key) => (
          <option key={key} value={key}>{SERVICE_LABELS[key]}</option>
        ))}
      </select>

      <label className="pf-check" style={{ marginTop: 14 }}>
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        É um plano recorrente (mensal), não avulso
      </label>

      <label className="pf-label" htmlFor="calc-amount">Valor da venda (R$)</label>
      <input
        id="calc-amount"
        className="pf-input"
        inputMode="decimal"
        placeholder="0,00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <div style={{ marginTop: 18 }}>
        {matches.length === 0 ? (
          <p className="pf-hint">Nenhuma regra de comissão ativa pra esse serviço no momento.</p>
        ) : (
          <>
            {matches.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13.5,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(61,31,21,.08)",
                }}
              >
                <span>
                  {r.name} <span style={{ color: "var(--ink-soft)" }}>({r.percentage}%)</span>
                  {r.min_clients > 0 && (
                    <>
                      {" "}
                      <span style={{ color: "var(--ink-soft)" }}>
                        — disponível a partir de {r.min_clients} {r.min_clients === 1 ? "cliente fechado" : "clientes fechados"}
                      </span>
                    </>
                  )}
                </span>
                <b>{(amountNumber * (r.percentage / 100)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</b>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 16 }}>
              <b>Total estimado</b>
              <b style={{ color: "var(--brown)" }}>
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </b>
            </div>
          </>
        )}
        <p className="pf-hint" style={{ marginTop: 10 }}>
          Simulação com base nas regras ativas hoje. O valor real de cada comissão segue sempre a
          regra vigente no momento do fechamento da venda.
        </p>
      </div>
    </div>
  );
}
