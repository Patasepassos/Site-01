"use client";

import { useEffect } from "react";

/**
 * O Supabase GoTrue manda link de recuperação/confirmação inválido ou
 * expirado como FRAGMENTO de URL (#error=...), nunca como querystring —
 * fragmento não é enviado ao servidor (o Next nunca vê isso em Server
 * Component nem Route Handler), só o navegador enxerga. Sem isso, o
 * parceiro clicava no link, caía aqui na home e não via nenhuma explicação
 * do que aconteceu.
 */
export default function AuthHashErrorRedirect() {
  useEffect(() => {
    if (window.location.hash.includes("error=")) {
      window.location.replace("/parceiros/login?erro=link-invalido");
    }
  }, []);

  return null;
}
