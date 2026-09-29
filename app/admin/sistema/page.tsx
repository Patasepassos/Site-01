import RemoveTestDataButton from "@/components/admin/RemoveTestDataButton";
import WipeSystemButton from "@/components/admin/WipeSystemButton";

export default function AdminSistemaPage() {
  return (
    <>
      <div className="portal-card">
        <h2>🧹 Dados de teste</h2>
        <p style={{ marginBottom: 12 }}>
          Remove só os parceiros e clientes marcados como teste (⋮ → Marcar como teste, em cada registro). Vendas
          reais, parceiros reais e pagamentos já registrados nunca são afetados por este botão.
        </p>
        <RemoveTestDataButton />
      </div>

      <div className="portal-card">
        <h2>⚠️ Zona de risco</h2>
        <p style={{ marginBottom: 12 }}>
          Apaga TODOS os parceiros, indicações, vendas, comissões e saques do sistema — não só os de teste. Use
          apenas pra reiniciar o painel do zero. As regras de comissão configuradas continuam intactas.
        </p>
        <WipeSystemButton />
      </div>
    </>
  );
}
