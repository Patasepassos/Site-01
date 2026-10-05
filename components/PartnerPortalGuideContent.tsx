// Explica como o Portal do Parceiro funciona HOJE — nada aqui descreve
// funcionalidade futura. Usado na página pública /parceiros/regras, na
// mesma etapa em que a pessoa lê os termos antes de concluir o cadastro.
export default function PartnerPortalGuideContent() {
  return (
    <div className="terms-body">
      <div className="terms-important" style={{ marginBottom: 18 }}>
        <b>🚧 Portal em Fase Beta</b>
        <p style={{ margin: "6px 0 0" }}>
          Algumas telas ainda estão sendo organizadas. Por exemplo, <b>Oportunidades</b> e{" "}
          <b>Notificações</b> hoje aparecem dentro da tela <b>Início</b> — ainda não são abas
          separadas. Nada abaixo é promessa de recurso futuro: é exatamente o que existe agora.
        </p>
      </div>

      <h3 style={{ marginTop: 0 }}>🏠 Painel Inicial</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        É a primeira tela depois do login. Nela você vê: seu nível atual no programa e o progresso
        até o próximo, quantas pessoas você já indicou e quantas já fecharam venda, se sua comissão
        está <b>bloqueada</b> ou <b>liberada</b>, suas notificações recentes e os links prontos pra
        divulgar cada serviço com seu cupom.
      </p>

      <h3>🔗 Indicações</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Quando você conhece alguém interessado, registra a indicação (nome + WhatsApp + serviço)
        direto na aba Indicações. A partir daí, a Patas &amp; Passos assume o contato: você acompanha
        o andamento pelo status — <i>Indicado</i>, <i>Em contato</i>, <i>Em negociação</i>,{" "}
        <i>Serviço contratado</i> — até o fechamento. Uma indicação só vira <b>venda fechada</b> (e só
        aí passa a contar pra sua meta de comissão) depois que o cliente realmente contrata e o
        pagamento é confirmado — não basta só ter sido indicado.
      </p>

      <h3>💰 Financeiro</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Tudo sobre dinheiro fica numa aba só: comissões geradas, saldo disponível e pendente, total já
        recebido, botão de solicitar saque e o histórico de saques com comprovante. As comissões têm
        3 estados:
      </p>
      <ul className="terms-list">
        <li><b>Bloqueada:</b> gerada, mas ainda esperando você bater a meta de clientes.</li>
        <li><b>Liberada:</b> meta atingida — o valor já soma no seu saldo disponível pra saque.</li>
        <li><b>Paga:</b> você já solicitou o saque e a Patas &amp; Passos confirmou o Pix, com comprovante anexado.</li>
      </ul>

      <h3>🎯 Oportunidades</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Hoje aparece dentro do <b>Início</b>, na seção &ldquo;Estrutura de níveis&rdquo;: mostra cada nível do
        programa (meta de clientes, % de comissão e benefícios) e qual nível você já alcançou. As
        metas e percentuais são sempre os vigentes no momento — a Patas &amp; Passos pode ajustá-los.
      </p>

      <h3>🔔 Notificações</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Aparecem em tempo real no card de Notificações da tela Início (sem precisar atualizar a
        página) e <b>também chegam no seu e-mail</b>: aprovação de cadastro, indicação avançando de
        status, venda fechada, comissão liberada, atualização de saque e mudanças nos seus dados de
        verificação.
      </p>

      <h3>👤 Perfil</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Seus dados pessoais, status de verificação (e-mail, WhatsApp, CPF/CNPJ e dados de pagamento),
        sua chave Pix e WhatsApp (alterar qualquer um dos dois exige nova confirmação antes do
        próximo pagamento), troca de senha e autenticação em dois fatores.
      </p>

      <h3>🛟 Suporte</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        O botão <b>&ldquo;Reportar um problema&rdquo;</b> fica disponível em qualquer tela do site e do portal —
        sua mensagem chega direto pra Patas &amp; Passos. Pra assuntos diretos (dúvidas sobre
        pagamento, negociação com cliente indicado, etc.), o contato é pelo WhatsApp oficial.
      </p>
    </div>
  );
}
