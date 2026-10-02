// Documentos legais/políticas do Portal do Parceiro. Cada seção descreve
// exatamente o que o sistema faz hoje (sem inventar prazos, integrações ou
// garantias que não existem) -- usado na mesma página pública /parceiros/regras
// já referenciada no checkbox de aceite do cadastro.
export default function PartnerLegalPoliciesContent() {
  return (
    <div className="terms-body">
      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>
        Última atualização: {new Date().toLocaleDateString("pt-BR")}. &ldquo;Patas &amp; Passos&rdquo;, neste
        documento, se refere à operação do programa de parceiros administrada pela equipe
        responsável pelo site patasepassos.com.br, cujo canal oficial de contato é{" "}
        <b>pataspassos4@gmail.com</b>.
      </p>

      <h3 style={{ marginTop: 0 }}>📄 Termos de Uso do Portal</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        O Portal do Parceiro é de uso pessoal e intransferível: o acesso é vinculado ao CPF/CNPJ e
        ao e-mail cadastrados, e as credenciais (senha e, se ativado, segundo fator) não devem ser
        compartilhadas. É proibido usar o Portal para cadastrar indicações falsas, criar mais de
        uma conta de parceiro com o mesmo CPF/CNPJ, ou fornecer dados de pagamento que não sejam
        seus. O descumprimento pode levar ao bloqueio da conta, conforme a seção &ldquo;Encerramento da
        parceria&rdquo; abaixo.
      </p>

      <h3>🔒 Política de Privacidade e LGPD</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Coletamos apenas os dados necessários para operar o programa de parceiros: nome completo,
        e-mail, WhatsApp, CPF ou CNPJ (para verificação de identidade e emissão de pagamento) e
        chave Pix (para realizar o pagamento das comissões). Esses dados são armazenados de forma
        segura (Supabase, com controle de acesso por linha — cada parceiro só acessa os próprios
        dados) e usados exclusivamente para: validar sua identidade, calcular e pagar comissões,
        contatar você sobre indicações e pagamentos, e cumprir obrigações legais quando aplicável.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Seus dados nunca são vendidos ou compartilhados com terceiros para fins de marketing. Você
        pode solicitar a exclusão da sua conta a qualquer momento pelo próprio Portal (Perfil →
        Excluir conta) — isso anonimiza seus dados pessoais (nome, CPF, chave Pix) no sistema,
        mantendo apenas o histórico financeiro já consolidado (exigido para fins contábeis). Para
        qualquer outro pedido relacionado aos seus dados pessoais (acesso, correção, portabilidade),
        o canal é <b>pataspassos4@gmail.com</b>.
      </p>
      <div className="terms-important">
        <b>⚠️ Transparência:</b>
        <p style={{ margin: "6px 0 0" }}>
          Este documento identifica a operação pelo nome comercial &ldquo;Patas &amp; Passos&rdquo; e pelo e-mail
          de contato acima. Caso a operação seja formalizada com CNPJ próprio, esta política deve
          ser atualizada para incluir razão social e CNPJ como controlador de dados.
        </p>
      </div>

      <h3>🍪 Política de Cookies</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        O site usa o Google Tag Manager para medir visitas e origem de tráfego — isso grava cookies
        de analytics no seu navegador. O Portal do Parceiro em si usa apenas um cookie técnico
        essencial (sessão de login via Supabase Auth), sem o qual não é possível manter você
        conectado. Hoje o site <b>não exibe um banner de consentimento de cookies</b> antes de
        carregar o Google Tag Manager — se isso for exigido para sua operação, é um ajuste a fazer
        separadamente.
      </p>

      <h3>🔗 Política de Indicações</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Uma indicação é válida quando registrada com o nome e WhatsApp reais da pessoa indicada, e
        ela passa a ser acompanhada pela Patas &amp; Passos através dos status: <i>Indicado</i>,{" "}
        <i>Em contato</i>, <i>Em negociação</i>, <i>Serviço contratado</i>, até <i>Fechado</i> (ou{" "}
        <i>Cancelado</i>/<i>Não convertido</i>). Indicações duplicadas do mesmo número de WhatsApp
        enquanto uma já está em andamento não são aceitas. Uma indicação só gera comissão depois
        que vira venda fechada com pagamento confirmado pela Patas &amp; Passos — o simples registro
        da indicação não garante comissão.
      </p>

      <h3>💰 Política de Comissões e Pagamentos</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        As regras de comissão (percentual e meta mínima de clientes) são definidas pela Patas &amp;
        Passos e podem ser ajustadas — o valor vigente é sempre o exibido no seu painel no momento.
        Toda comissão nasce <b>bloqueada</b> e só é <b>liberada</b> quando a meta de clientes ativos
        é atingida. O pagamento é sempre feito manualmente via Pix pela Patas &amp; Passos, mediante
        solicitação de saque pelo parceiro (saldo mínimo de R$ 20), e só é considerado{" "}
        <b>pago</b> depois de confirmado com comprovante anexado no Portal. A Patas &amp; Passos
        pode corrigir ou cancelar uma venda <b>antes</b> da confirmação do pagamento (ex.: cliente
        desistiu); após o pagamento confirmado, a transação é considerada final.
      </p>

      <h3>🛟 Política de Suporte</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        O canal de suporte do Portal é o botão <b>&ldquo;Reportar um problema&rdquo;</b>, disponível em
        qualquer tela do site, que envia sua mensagem direto para a equipe Patas &amp; Passos. Para
        assuntos que envolvam negociação com o cliente indicado ou dúvidas sobre pagamento, o
        contato é pelo WhatsApp oficial. Não há SLA (prazo de resposta) formalizado hoje — o
        atendimento é feito conforme a disponibilidade da equipe.
      </p>

      <h3>🛡️ Segurança da Conta</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Sua conta exige senha forte (mínimo 10 caracteres, com maiúscula, minúscula, número e
        símbolo) e oferece autenticação em dois fatores (2FA) opcional, configurável em Perfil.
        Alterar sua chave Pix ou WhatsApp exige nova confirmação antes do próximo pagamento, para
        evitar que uma conta comprometida redirecione seus pagamentos. Recomendamos ativar o 2FA e
        nunca compartilhar sua senha ou código de verificação com ninguém — a Patas &amp; Passos
        nunca pede sua senha por WhatsApp ou e-mail.
      </p>

      <h3>🚪 Encerramento da Parceria</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        Você pode encerrar sua participação a qualquer momento excluindo sua conta em Perfil →
        Excluir conta — isso bloqueia o acesso e anonimiza seus dados pessoais, mantendo o
        histórico financeiro já consolidado. A Patas &amp; Passos pode bloquear uma conta em caso de
        uso indevido (ex.: indicações falsas, dados inconsistentes) ou reprovar uma solicitação de
        parceria ainda pendente — em ambos os casos, você é avisado por e-mail. Comissões já
        liberadas antes do encerramento continuam devidas e seguem o fluxo normal de saque.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.7 }}>
        <b>Compromisso de atividade:</b> esperamos que, como parceiro(a), você continue indicando
        clientes de tempos em tempos. Uma conta que ficar <b>365 dias seguidos sem nenhuma nova
        indicação registrada</b> é considerada inativa e pode ser removida pela Patas &amp; Passos —
        mesmo processo de anonimização acima, preservando o que já foi ganho. Basta registrar uma
        indicação de vez em quando pra manter sua conta ativa.
      </p>
    </div>
  );
}
