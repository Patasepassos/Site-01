"use client";

import { useState } from "react";
import Link from "next/link";
import { waLink, waMessages } from "@/lib/site";

const TABS = [
  {
    key: "passeios",
    emoji: "🐾",
    label: "Passeios",
    sub: "Dog Walker",
    href: "/passeios",
    waMsg: waMessages.passeios,
    title: "Energia gasta, dog feliz e equilibrado",
    desc: "Passeios seguros e personalizados que garantem exercício, bem-estar e estímulo mental. Seu pet se exercita, reduz o estresse e vive com mais qualidade de vida.",
    highlights: [
      "Passeios seguros e personalizados",
      "Busca e entrega em casa",
      "Fotos e relatório após cada passeio",
      "Ter–Sex 18h–20h · Sáb–Dom 8h–12h",
    ],
    benefits: [
      ["🏃", "Saúde Física", "Controle de peso e fortalecimento muscular."],
      ["🧠", "Estímulo Mental", "Novos ambientes mantêm a mente ativa."],
      ["😌", "Menos Ansiedade", "Passeios regulares reduzem estresse."],
      ["😴", "Melhor Sono", "Pet exercitado dorme melhor em casa."],
    ],
  },
  {
    key: "socializacao",
    emoji: "🐕",
    label: "Socialização",
    sub: "Passeios em Grupo",
    href: "/socializacao",
    waMsg: waMessages.socializacao,
    title: "Novos amigos, mais equilíbrio",
    desc: "Passeios em grupo cuidadosamente planejados para promover a socialização do seu pet com outros cães, de forma segura e supervisionada.",
    highlights: [
      "Grupos pequenos e supervisionados",
      "Avaliação comportamental prévia",
      "Parques e áreas verdes da cidade",
      "Horários flexíveis",
    ],
    benefits: [
      ["🤝", "Sociabilidade", "Contato saudável com outros cães e pessoas."],
      ["⚡", "Energia Equilibrada", "Gasto de energia em grupo de forma divertida."],
      ["😊", "Menos Tédio", "Estímulo extra pra pets que ficam sós em casa."],
      ["🌿", "Ao ar Livre", "Espaços verdes e novos cheiros a cada saída."],
    ],
  },
  {
    key: "petsitter",
    emoji: "🏡",
    label: "Pet Sitter",
    sub: "Cuidado em Casa",
    href: "/pet-sitter",
    waMsg: waMessages.petsitter,
    title: "Cuidado no conforto da própria casa",
    desc: "Quando você precisa se ausentar, a gente vai até o seu pet. Ele fica no ambiente que conhece, com a rotina de sempre — sem o stress de mudar de lugar.",
    highlights: [
      "Rotina mantida (comida, água, higiene)",
      "Ideal para viagens e dias longos",
      "Fotos e relatório a cada visita",
      "Sem stress de mudança de ambiente",
    ],
    benefits: [
      ["🏠", "Em Casa", "Seu pet no ambiente que ele já conhece e ama."],
      ["📸", "Atualizações", "Fotos e resumo de cada visita pra você."],
      ["💊", "Medicação", "Administramos remédios no horário certo."],
      ["🌙", "Pernoite", "Disponível para cuidado noturno quando necessário."],
    ],
  },
  {
    key: "hotel",
    emoji: "🏠",
    label: "Hotel",
    sub: "Hospedagem",
    href: "/hotel",
    waMsg: waMessages.hotel,
    title: "Viaje tranquilo. Ele fica em boas patas",
    desc: "Hospedagem com a sensação de casa: rotina, conforto e companhia o tempo todo. Seu melhor amigo dorme em paz e você recebe notícias dele.",
    highlights: [
      "Ambiente climatizado e seguro",
      "Rotina respeitada (alimentação e passeios)",
      "Fotos diárias pra você acompanhar",
      "Espaço individual e cuidado atento",
    ],
    benefits: [
      ["🛏️", "Conforto", "Espaço próprio e cama confortável."],
      ["🍽️", "Rotina", "Alimentação no horário certo, todos os dias."],
      ["👁️", "Monitoramento", "Equipe presente e atenta o tempo todo."],
      ["📩", "Novidades", "Fotos e atualizações diárias pra você."],
    ],
  },
  {
    key: "vacinas",
    emoji: "💉",
    label: "Vacinas",
    sub: "A domicílio",
    href: "/vacinas",
    waMsg: waMessages.vacinas,
    title: "Vacinação sem stress, no conforto de casa",
    desc: "A gente vai até você. Seu pet é vacinado no ambiente que conhece, sem a tensão da sala de espera nem o risco de contato com animais doentes.",
    highlights: [
      "Sem deslocamento nem sala de espera",
      "Menor risco de contágio em clínicas",
      "Carteirinha atualizada e orientações",
      "Agendamento pelo WhatsApp",
    ],
    benefits: [
      ["🏠", "Em Casa", "Vacinação no ambiente familiar do pet."],
      ["🛡️", "Menos Risco", "Sem contato com animais doentes em clínicas."],
      ["📋", "Carteirinha", "Registro atualizado e próximas datas anotadas."],
      ["🕐", "Seu Horário", "Agendamento no dia e hora que cabem em você."],
    ],
  },
];

const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M16 4C9.9 4 5 8.9 5 15c0 2.1.6 4.1 1.7 5.8L5 27l6.4-1.7c1.6.9 3.5 1.4 5.4 1.4 6.1 0 11-4.9 11-11S22.1 4 16 4zm0 20c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-3.8 1 1-3.7-.2-.4C7 18.7 6.5 16.9 6.5 15 6.5 9.8 10.8 5.5 16 5.5S25.5 9.8 25.5 15 21.2 24 16 24zm5.3-6.9c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
  </svg>
);

export default function ServiceTabs() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];
  const wa = waLink(tab.waMsg);

  return (
    <div className="stabs-wrap">
      {/* Tab bar */}
      <div className="stabs-bar" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={i === active}
            className={`stab${i === active ? " stab-on" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="stab-emoji">{t.emoji}</span>
            <span className="stab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="stabs-panel" role="tabpanel">
        <div className="stabs-main">
          <div className="stabs-info">
            <span className="eyebrow">{tab.emoji} {tab.sub}</span>
            <h2 className="h-lg" style={{ marginTop: 10 }}>{tab.title}</h2>
            <p className="lead" style={{ marginTop: 12 }}>{tab.desc}</p>

            <ul className="stabs-list">
              {tab.highlights.map((h, i) => (
                <li key={i}>
                  <span className="stab-check">✓</span> {h}
                </li>
              ))}
            </ul>

            <div className="cta-row" style={{ marginTop: 24 }}>
              <a className="btn btn-wa btn-lg" href={wa} target="_blank" rel="noopener">
                <WaIcon /> Agendar pelo WhatsApp
              </a>
              <Link className="btn btn-white btn-lg" href={tab.href}>
                Saiba mais →
              </Link>
            </div>
          </div>

          <div className="stabs-benefits">
            <p className="stabs-ben-title">Por que vale a pena</p>
            <div className="stabs-ben-grid">
              {tab.benefits.map(([emoji, title, desc]) => (
                <div key={title as string} className="stabs-ben-card">
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <div>
                    <strong>{title as string}</strong>
                    <p>{desc as string}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
