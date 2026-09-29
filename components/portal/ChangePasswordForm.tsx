"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ChangePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("Não foi possível trocar a senha.");
      return;
    }
    setSuccess(true);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="pf-label" htmlFor="newPassword">Nova senha</label>
      <input
        id="newPassword"
        type="password"
        className="pf-input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        required
      />
      <label className="pf-label" htmlFor="confirmNewPassword">Confirmar nova senha</label>
      <input
        id="confirmNewPassword"
        type="password"
        className="pf-input"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        minLength={8}
        required
      />

      {error && <p className="pf-error">{error}</p>}
      {success && <p className="pf-success">Senha atualizada!</p>}

      <button className="pf-submit" type="submit" disabled={loading}>
        {loading ? "Salvando…" : "Trocar senha"}
      </button>
    </form>
  );
}
