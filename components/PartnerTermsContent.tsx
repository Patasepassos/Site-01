// Texto único dos termos de parceria — usado no modal (Parceiros) e na
// página pública /parceiros/regras, além de referenciado no cadastro.
export default function PartnerTermsContent() {
  return (
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
          <b>Contato e pagamento via WhatsApp:</b> você entra em contato conosco pelo WhatsApp,
          acertamos tudo por lá e enviamos o comprovante.
        </li>
        <li>
          <b>Pagamento mensal via Pix:</b> os 5 primeiros clientes indicados por você são pagos no
          dia 05. Os pagamentos seguintes (recorrentes) caem no dia 30.
        </li>
        <li>
          <b>Pagamento recorrente apenas se houver compra contínua:</b> o pagamento só será
          recorrente caso algum dos 5 clientes feche um serviço todo mês ou no plano anual.
        </li>
      </ul>

      <p style={{ fontWeight: 700, margin: "0 0 8px" }}>Como funciona na prática:</p>
      <ol className="terms-list">
        <li>Você se cadastra e recebe um cupom exclusivo.</li>
        <li>Você indica clientes, que usam seu cupom ao contratar.</li>
        <li>O sistema registra cada indicação e acompanha o progresso pra você.</li>
        <li>Os 5 clientes fecham os serviços com o seu cupom.</li>
        <li>O pagamento dos 5 primeiros clientes é feito via Pix no dia 05 do mês.</li>
        <li>
          Se 1 cliente for fiel, você recebe 1% do valor no dia 30 do mês. Se os 5 forem fiéis,
          você recebe 5%. Pagamentos recorrentes seguintes caem sempre no dia 30.
        </li>
      </ol>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>
        Esses dois percentuais só se aplicam caso o cliente feche serviço mensal ou anual. As
        porcentagens e a quantidade mínima de clientes podem ser ajustadas pela Patas & Passos —
        o valor exibido no seu painel é sempre o vigente no momento.
      </p>

      <div className="terms-important">
        <b>⚠️ Importante!</b>
        <ul>
          <li>
            Se uma das 5 pessoas não comprar nossos serviços, o pagamento é inválido e não haverá
            comissão.
          </li>
          <li>O pagamento é realizado apenas quando os 5 clientes fecharem os serviços com o seu cupom.</li>
          <li>O valor da sua comissão só é exibido no painel depois que a meta é atingida.</li>
        </ul>
      </div>
    </div>
  );
}
