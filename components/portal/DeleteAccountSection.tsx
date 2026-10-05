"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const CONFIRM_PHRASE = "EXCLUIR CONTA";

type Stage = "idle" | "confirm" | "typed" | "done";

export default function DeleteAccountSection() {
  const [stage, setStage] = useState<Stage>("idle");
  const [typedConfirm, setTypedConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parceiros/excluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: typedConfirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível excluir a conta.");
        return;
      }
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      setStage("done");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (stage === "done") {
    return (
      <div className="portal-card">
        <h2>Conta excluída</h2>
        <p style={{ marginTop: 8 }}>Sua conta de parceiro foi encerrada com sucesso.</p>
        <p style={{ marginTop: 4 }}>Agradecemos por ter feito parte da Patas &amp; Passos.</p>
        <a className="btn btn-wa btn-lg" href="/" style={{ marginTop: 14, display: "inline-block" }}>
          Voltar ao site
        </a>
      </div>
    );
  }

  return (
    <div className="portal-card" style={{ borderColor: "rgba(179,38,30,.3)" }}>
      <h2>Zona de segurança</h2>

      {stage === "idle" && (
        <>
          <p style={{ marginTop: 8, fontSize: 13.5, color: "var(--ink-soft)" }}>
            A exclusão da conta é uma ação permanente. Seus dados e acesso ao programa de parceiros poderão ser
            removidos ou anonimizados conforme as regras de retenção de dados da Patas &amp; Passos.
          </p>
          <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 12 }} onClick={() => setStage("confirm")}>
            Excluir minha conta
          </button>
        </>
      )}

      {stage === "confirm" && (
        <div style={{ marginTop: 8 }}>
          <p className="pf-error">
            ⚠️ Tem certeza que deseja excluir sua conta?
            <br />
            Essa ação encerrará seu acesso ao programa de parceiros.
            <br />
            Essa ação não pode ser desfeita pelo próprio usuário.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" className="btn btn-sm" onClick={() => setStage("idle")}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setStage("typed")}>
              Continuar com exclusão
            </button>
          </div>
        </div>
      )}

      {stage === "typed" && (
        <div style={{ marginTop: 8 }}>
          <label className="pf-label" htmlFor="deleteConfirm">
            Para confirmar, digite: <b>{CONFIRM_PHRASE}</b>
          </label>
          <input
            id="deleteConfirm"
            className="pf-input"
            value={typedConfirm}
            onChange={(e) => setTypedConfirm(e.target.value)}
            autoComplete="off"
          />
          {error && <p className="pf-error">{error}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setStage("idle");
                setTypedConfirm("");
                setError(null);
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={loading || typedConfirm !== CONFIRM_PHRASE}
              onClick={handleDelete}
            >
              {loading ? "Excluindo…" : "Excluir minha conta definitivamente"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
