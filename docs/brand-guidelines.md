# Patinhas de Amor — Contexto Base (Brand Guidelines)

> Todos os agentes leem este arquivo antes de qualquer tarefa. Atualize quando o cliente confirmar dados pendentes.

## Identidade da empresa

- **Nome:** Patinhas de Amor
- **Segmento:** Cuidado pet (NÃO é adoção — corrija qualquer doc que diga "adoção")
- **Localização:** São Paulo / SP (região da capital paulista)
- **Serviços:** Creche · Hotel · Banho & Tosa · **Taxi Dog** (busca e entrega do pet)
- **Promessa central:** "Um cantinho feito de amor pro seu melhor AUmigo" — mais socialização, menos ansiedade, doguinho feliz esperando em casa.

## Público-alvo (ICP)

Tutores de cães da região do ABC que tratam o pet como família, têm rotina ocupada (trabalho/viagens) e buscam um lugar de confiança, carinhoso e prático (com transporte). Dores: culpa por deixar o cão sozinho, ansiedade de separação do pet, falta de tempo para levar ao banho.

## Sistema visual (tokens em `site-export/site.css`)

```
--blue:#2F74E6   --blue-deep:#1E55B8   --blue-soft:#AFCDF6   --blue-tile:#3B82F6
--ink:#1F2E4D    --ink-soft:#5C6B89    --coral:#FF8A5B
--bg1:#EAF3FF    --bg2:#D7E7FD         (fundo: gradiente 165deg bg1→bg2)
```
- **Títulos:** `Baloo 2` (cursive, peso 700–800) — arredondada, fofa.
- **Texto:** `Nunito` (400–800).
- **Formas:** cantos bem arredondados (`border-radius` alto, pílulas `999px`), blobs orgânicos, patinhas 🐾 como ícone-assinatura, sombras suaves azuladas.

## Voz da marca

- **Tom:** afetivo, fofo, acolhedor, levemente brincalhão. Trata o cão como "AUmigo".
- **Faz:** usar trocadilhos com "au" com moderação ("AUmigo", "Au Au"), falar com o tutor de igual pra igual, focar em sentimento (carinho, segurança, alegria) + benefício prático (taxi dog, avaliação grátis).
- **Não faz:** jargão técnico, tom corporativo frio, promessas exageradas/médicas, excesso de emoji.

## Mascote

- Cão-mascote interativo "Auau". No export estático é montado por JS a partir de camadas PNG (`MascotAuau`): cabeça segue o cursor (±8°), pupilas acompanham, pisca aleatório, respiração, orelhas/língua idle, **rabo abana** (acelera com proximidade). Respeita `prefers-reduced-motion`.
- Layout base 360×380; peças em `site-export/mascot/` (`02_head.png`, `04_ears.png`, `06_tongue.png`, `mouth_edit.png`, `eyes_base.png`, `eyes_pupils.png`, `body_edit.png`, `body_notail.png`, `tail_edit.png`). Logo: `logo-full.png`, `logo-face.png` (favicon), `dog-cutout.png` (top bar).
- Versão React/Next.js prevista: `MascotAuau.tsx` (Framer Motion) + `mascot-layout.json`, mesmo layout. Para Next.js, copiar `mascot/` para `public/`.

## Front-end já entregue (fonte da verdade)

Export estático em `_extracted/site-export/` (feito no Claude Design):
- `index.html` (home, hero com mascote) · `creche.html` · `hotel.html` · `banho.html` · `site.css` (tokens compartilhados) · `mascot/` (arte em camadas + logo).
- Páginas trazem: benefícios, rotina, estrutura/acomodações, galeria, depoimentos, CTA; banho com Taxi Dog e bolhas animadas.

## Contatos e redes (do site oficial — `patinhasdeamor.com`)

Referências para o site e botões:
- **Instagram:** `https://www.instagram.com/patinhasdeamor/` (@patinhasdeamor)
- **WhatsApp:** `https://api.whatsapp.com/send?phone=551126684770&text=Olá! Vim através do site, gostaria de saber mais informações sobre a creche.` (número 55 11 2668-4770)
- **Facebook:** `https://www.facebook.com/patinhasdeamor`
- **Telefone:** (11) 2668-4770
- **Serviços (site oficial):** Creche · Hotel · Banho & Tosa · Taxi Dog · Avaliação grátis.
- **CNPJ:** ⚠️ confirmar com o cliente.

### Endereço (destino do site)
- **No site:** **Rua Estados Unidos, 1420 — Jardim América, São Paulo/SP**. **Uma** unidade.
- Alternativa que aparecia em diretórios (descartada): R. Amazonas, 720 (Solutudo/brazilfirmas).

## Pendências do cliente (bloqueiam DoD)

- ⚠️ **E-mail e horário de funcionamento** — não constam em nenhuma fonte (Receita: e-mail null). Sem inventar: contato via WhatsApp até o cliente passar.
- ⚠️ **Fotos reais** — placeholders `.ph` (azuis com patinha) marcam onde entram fotos.
- ⚠️ **Textos** — copy atual é base fofa; refinar com A3 e validar com o cliente.

## Restrições para todos os agentes

- **Nunca fabricar dados.** Telefone, preço, depoimento, métrica sem fonte → marcar `⚠️ NOT AVAILABLE` ou `📊 ESTIMATIVA`.
- Manter sistema visual (cores/fontes/formas) acima — não introduzir nova identidade sem aprovação de A2.
- Mobile-first; respeitar `prefers-reduced-motion`.
- Responder sempre em português, tom alinhado à voz da marca quando for conteúdo público.

*Última atualização: 2026-06-15*
