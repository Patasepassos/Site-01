# Briefing de Kickoff — Patinhas de Amor

> Projeto #1 da Fábrica Dolvitta. Preenchido a partir do estudo do export entregue. Itens `⚠️` aguardam confirmação do cliente.

## Identificação
- **Nome do projeto:** Patinhas de Amor — Site
- **Cliente / empresa:** Patinhas de Amor (cuidado pet)
- **Tipo de site:** ☑ Site institucional (INST) — multipágina (home + 3 serviços)
- **Responsável Dolvitta:** Henry
- **Data de kickoff:** 2026-06-15 · **Prazo desejado:** ⚠️ a definir

## Objetivo
- **Objetivo principal:** gerar contatos/agendamentos (WhatsApp) para creche, hotel e banho; passar confiança e afeto.
- **Como medir sucesso:** nº de cliques no WhatsApp / "Agendar visita" · agendamentos de avaliação grátis · `📊` (instrumentar com A8).
- **O que existe hoje:** ☑ Front-end estático pronto (Claude Design) em `_extracted/site-export/`. ⚠️ Confirmar se há site/Instagram atual a migrar.

## Público
- **Público-alvo:** tutores de cães de São Paulo capital e região, rotina ocupada, pet = família.
- **Ação desejada:** agendar avaliação grátis / falar no WhatsApp / conhecer a creche.

## Conteúdo & Marca
- **Identidade visual:** ☑ Sim — definida (ver `brand-guidelines.md`): azul #2F74E6 + coral #FF8A5B, Baloo 2 + Nunito, mascote interativo.
- **Tom de voz:** afetivo, fofo, "AUmigo".
- **Textos/imagens:** copy base já existe; ⚠️ cliente fornece **fotos reais** e valida textos. Dolvitta refina copy (A3).

## Estrutura
- **Páginas:** Início · Creche · Hotel · Banho & Tosa (+ seção Contato). Nav já existe na top bar.
- **Funcionalidades especiais:** mascote interativo no hero; CTAs de WhatsApp; galeria; depoimentos; selo "2 dias grátis".
- **Integrações:** WhatsApp (link `wa.me`); ⚠️ formulário de agendamento (avaliar A5); analytics (A8).

## Referências
- **Gosta:** o próprio design entregue (mascote, blobs, patinhas, tom fofo).
- **Evitar:** visual corporativo frio, clip-art genérico de pet, excesso de texto.

## Restrições
- **Orçamento/faixa:** ⚠️ a definir (entra na proposta comercial — A9).
- **Domínio e hospedagem:** ⚠️ a definir. Padrão Dolvitta: Vercel.
- **Prazos fixos:** ⚠️ a definir.

## Time do projeto (agentes ativos)
☑ A0 PMO ☑ A1 Discovery ☑ A2 Estratégia ☑ A3 Conteúdo ☑ A4 Design ☑ A5 Engenharia ☑ A6 QA ☑ A7 SEO ☑ A8 Dados ☑ A9 Comercial ☐ A10 Jurídico ☐ A11 Financeiro
*(A10/A11 acionados quando fechar contrato e medição.)*

## Prioridade definida pelo cliente (Henry)
**Construir o site primeiro** → começar pela Fase 3 (Build): portar o export estático para **Next.js + TS + Tailwind**, integrar o mascote e a copy. Proposta comercial (A9) roda em paralelo/depois.

## Decisão técnica pendente para A5
O export usa o mascote `MascotAuau` (camadas PNG, layout 360×380). O `CLAUDE.md` legado descreve um pipeline alternativo (`MascotDog` com slices/vtracer). **Fonte da verdade = o export entregue.** A5 deve portar o `MascotAuau` (PNG em camadas) para `components/mascot/MascotAuau.tsx` no Next.js, copiando `mascot/` para `public/`.
