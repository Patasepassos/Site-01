"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { waLink, waMessages } from "@/lib/site";

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

            <div className="terms-body">
              <div className="terms-highlight">
                🐾 <b>5 clientes = 5%</b>
                <br />
                Você indica 5 clientes e ganha 5% do valor total das vendas fechadas por eles.
              </div>

              <ul className="terms-list">
                <li>
                  <b>Usamos o método de cupom:</b> você escolhe um nome para o seu cupom e assim
                  conseguimos fazer o fechamento e o levantamento.
                </li>
                <li>
                  <b>Contato e pagamento via WhatsApp:</b> você entra em contato conosco pelo
                  WhatsApp, acertamos tudo por lá e enviamos o comprovante.
                </li>
                <li>
                  <b>Pagamento mensal via Pix:</b> os 5 primeiros clientes indicados por você são
                  pagos no dia 05. Os pagamentos seguintes (recorrentes) caem no dia 30.
                </li>
                <li>
                  <b>Pagamento recorrente apenas se houver compra contínua:</b> o pagamento só
                  será recorrente caso algum dos 5 clientes feche um serviço todo mês ou no plano
                  anual.
                </li>
              </ul>

              <p style={{ fontWeight: 700, margin: "0 0 8px" }}>Como funciona na prática:</p>
              <ol className="terms-list">
                <li>Você indica e conquista os 5 clientes com o nosso cupom.</li>
                <li>Os 5 clientes fecham os serviços com o cupom da pessoa.</li>
                <li>O pagamento dos 5 primeiros clientes é feito via Pix no dia 05 do mês.</li>
                <li>
                  Se 1 cliente for fiel, você recebe 1% do valor no dia 30 do mês. Se os 5 forem
                  fiéis, você recebe 5%. Pagamentos recorrentes seguintes caem sempre no dia 30.
                </li>
              </ol>
              <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>
                Esses dois percentuais só se aplicam caso o cliente feche serviço mensal ou anual.
              </p>

              <div className="terms-important">
                <b>⚠️ Importante!</b>
                <ul>
                  <li>
                    Se uma das 5 pessoas não comprar nossos serviços, o pagamento é inválido e não
                    haverá comissão.
                  </li>
                  <li>
                    O pagamento é realizado apenas quando os 5 clientes fecharem os serviços com
                    o seu cupom.
                  </li>
                </ul>
              </div>
            </div>

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
