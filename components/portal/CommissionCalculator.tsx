"use client";

import { useState } from "react";

export default function CommissionCalculator({ percentage }: { percentage: number }) {
  const [amount, setAmount] = useState("");
  const parsed = Number(amount.replace(",", "."));
  const valid = amount.trim() !== "" && !Number.isNaN(parsed) && parsed >= 0;
  const commission = valid ? (parsed * percentage) / 100 : null;

  return (
    <div>
      <label className="pf-label" htmlFor="saleAmount">Valor da venda (R$)</label>
      <input
        id="saleAmount"
        className="pf-input"
        inputMode="decimal"
        placeholder="Ex: 250,00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {commission !== null && (
        <div className="portal-stat" style={{ marginTop: 16 }}>
          <span className="label">Comissão estimada ({percentage}%)</span>
          <span className="num">
            {commission.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
      )}
    </div>
  );
}
