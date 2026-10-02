"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Botão flutuante "Reportar um problema" -- fica disponível em TODAS as
 * páginas (público, portal do parceiro, admin), mesmo pra quem não está
 * logado ou foi bloqueado, já que é renderizado direto no layout raiz, fora
 * de qualquer guarda de autenticação.
 */
export default function ReportIssueButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let userEmail = "";
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userEmail = user?.email ?? "";
      } catch {
        // Sem sessão ou Supabase indisponível -- reporta sem e-mail mesmo.
      }

      const res = await fetch("/api/reportar-problema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          pageUrl: window.location.href,
          userEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível enviar agora.");
        return;
      }
      setSuccess(true);
      setMessage("");
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function closeAndReset() {
    setOpen(false);
    setSuccess(false);
    setError(null);
    setMessage("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Reportar um problema"
        style={{
          position: "fixed",
          bottom: 20,
          left: 20,
          zIndex: 9998,
          background: "#4a3427",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        🐞 Reportar um problema
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={closeAndReset}
        >
          <div
            className="portal-card"
            style={{ maxWidth: 420, width: "100%", background: "#fff" }}
            onClick={(e) => e.stopPropagation()}
          >
            {success ? (
              <>
                <h2>Obrigado!</h2>
                <p>Recebemos seu relato e vamos analisar. 🐾</p>
                <button type="button" className="btn btn-wa btn-sm" style={{ marginTop: 10 }} onClick={closeAndReset}>
                  Fechar
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2>Reportar um problema</h2>
                <p className="pf-hint">Conte o que aconteceu — recebemos direto por e-mail.</p>
                <textarea
                  className="pf-input"
                  style={{ minHeight: 100, resize: "vertical" }}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva o problema..."
                  maxLength={2000}
                  required
                  autoFocus
                />
                {error && <p className="pf-error">{error}</p>}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button type="submit" className="btn btn-wa btn-sm" disabled={loading}>
                    {loading ? "Enviando…" : "Enviar"}
                  </button>
                  <button type="button" className="btn btn-sm" disabled={loading} onClick={closeAndReset}>
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
