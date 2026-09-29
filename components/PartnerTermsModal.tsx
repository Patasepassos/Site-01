"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { waLink, waMessages } from "@/lib/site";
import PartnerTermsContent from "./PartnerTermsContent";

export default function PartnerTermsModal({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function openModal() {
    setAccepted(false);
    setDenied(false);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  function handleAccept() {
    if (!accepted) return;
    window.open(waLink(waMessages.parceriaAceita), "_blank", "noopener");
    closeModal();
  }

  const modal = (
    <div
      className="terms-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="terms-modal">
        <button type="button" className="terms-close" aria-label="Fechar" onClick={closeModal}>
          ×
        </button>

        {!denied ? (
          <>
            <span className="eyebrow">🤝 Antes de continuar</span>
            <h2 id="terms-title" className="h-lg" style={{ marginTop: 8 }}>
              Termos de <span className="hl">Parceria</span>
            </h2>
            <p className="lead" style={{ marginBottom: 4 }}>
              Você indica, a gente cuida. E todos saem ganhando! Leia com atenção antes de entrar
              em contato pelo WhatsApp.
            </p>

            <PartnerTermsContent />

            <label className="terms-check">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              Li e aceito os termos de parceria acima.
            </label>

            <div className="terms-actions">
              <button type="button" className="btn btn-white" onClick={() => setDenied(true)}>
                Não aceito
              </button>
              <button type="button" className="btn btn-wa" disabled={!accepted} onClick={handleAccept}>
                Aceito e quero conversar
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🐾</div>
            <h2 className="h-lg">Parceria não confirmada</h2>
            <p className="lead">
              Sem aceitar os termos de parceria, não conseguimos seguir com essa parceria. Se
              mudar de ideia, é só abrir de novo e aceitar os termos.
            </p>
            <button
              type="button"
              className="btn btn-white"
              onClick={closeModal}
              style={{ marginTop: 10 }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button type="button" className={className} style={style} onClick={openModal}>
        {children}
      </button>
      {open && mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
