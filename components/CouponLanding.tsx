"use client";

import { useState } from "react";
import { waLink, waMessages } from "@/lib/site";
import type { ServiceKey } from "@/lib/supabase/types";

const COUPON_COOKIE = "pp_coupon";

export default function CouponLanding({
  code,
  valid,
  serviceKey,
  serviceLabel,
  servicePath,
}: {
  code: string;
  valid: boolean;
  serviceKey: ServiceKey | null;
  serviceLabel: string | null;
  servicePath: string | null;
}) {
  const [applied, setApplied] = useState(false);
  const cleanService = serviceLabel ? serviceLabel.replace(/^\S+\s/, "") : null;

  function handleApply() {
    try {
      // Guarda cupom+serviço por 7 dias: se o cliente navegar pelo site antes
      // de falar no WhatsApp, o cupom continua associado à visita sem
      // precisar digitar o código de novo.
      const value = encodeURIComponent(`${code}|${serviceKey ?? ""}`);
      document.cookie = `${COUPON_COOKIE}=${value}; max-age=${60 * 60 * 24 * 7}; path=/`;
    } catch {
      // Modo privado/cookies bloqueados: segue sem persistir, sem travar o fluxo.
    }
    setApplied(true);
  }

  const message = cleanService
    ? `Olá! 🐾 Usei o cupom *${code}* e quero garantir minha condição especial em ${cleanService}.`
    : `Olá! 🐾 Usei o cupom *${code}* e quero saber mais sobre os serviços da Patas & Passos.`;

  if (!valid) {
    return (
      <div className="wrap" style={{ padding: "90px 0", textAlign: "center" }}>
        <span className="eyebrow">🎟️ Cupom</span>
        <h1 className="h-xl" style={{ marginTop: 14 }}>
          Esse cupom não está mais disponível
        </h1>
        <p className="lead" style={{ margin: "16px auto 30px", maxWidth: 460 }}>
          {code
            ? `O código ${code} não foi encontrado ou não está mais ativo.`
            : "Nenhum código de cupom foi informado."}{" "}
          Mas você ainda pode falar com a gente — cuidamos do seu pet com todo carinho.
        </p>
        <a className="btn btn-wa btn-lg" href={waLink(waMessages.default)} target="_blank" rel="noopener">
          Falar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="wrap" style={{ padding: "90px 0", textAlign: "center" }}>
      <span className="eyebrow">🎟️ Cupom {code}</span>
      <h1 className="h-xl" style={{ marginTop: 14 }}>
        {cleanService ? (
          <>
            Sua condição especial em <span className="hl">{cleanService}</span> está disponível!
          </>
        ) : (
          <>Sua condição especial está disponível!</>
        )}
      </h1>
      <p className="lead" style={{ margin: "16px auto 30px", maxWidth: 460 }}>
        Você foi indicado por um parceiro Patas &amp; Passos. Aplique o cupom <b>{code}</b> e garanta sua
        condição especial nesta contratação.
      </p>

      {!applied ? (
        <button type="button" className="btn btn-wa btn-lg" onClick={handleApply}>
          Aplicar cupom {code}
        </button>
      ) : (
        <>
          <p style={{ color: "#2E7D32", fontWeight: 700, marginBottom: 20 }}>
            ✓ Cupom aplicado — seu benefício será considerado nesta contratação.
          </p>
          <div className="cta-row" style={{ justifyContent: "center" }}>
            <a className="btn btn-wa btn-lg" href={waLink(message)} target="_blank" rel="noopener">
              Continuar para contratar
            </a>
            {servicePath && (
              <a className="btn btn-white btn-lg" href={servicePath}>
                Ver detalhes do serviço
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}
