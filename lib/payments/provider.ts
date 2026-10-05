import "server-only";
import type { PixKeyType } from "@/lib/supabase/types";

export type PixPayoutRequest = {
  payoutId: string;
  amount: number;
  pixKey: string;
  pixKeyType: PixKeyType;
  idempotencyKey: string;
};

export type PixPayoutStatus = "completed" | "requires_manual_proof";

export type PixPayoutResult = {
  status: PixPayoutStatus;
  providerTransactionId: string | null;
};

/**
 * Ponto de troca de provedor financeiro. Hoje só existe `ManualPixProvider`
 * — não há credencial, contrato ou integração real com nenhum banco. Um
 * provedor futuro (Stone Banking Gateway, Asaas, Efí...) implementa essa
 * mesma interface e, quando `status: "completed"` vier de verdade da API do
 * banco, a rota de pagamento pode dispensar o comprovante manual. Até lá,
 * `requires_manual_proof` é a única resposta honesta.
 */
export interface PaymentProvider {
  readonly name: string;
  payPixCommission(request: PixPayoutRequest): Promise<PixPayoutResult>;
}

/**
 * Não chama nenhuma API. Formaliza o que já é verdade hoje: o Pix é feito
 * manualmente pelo admin no banco/Ton, fora do sistema, e só é registrado
 * como pago depois que ele anexa o comprovante. Nunca retorna "completed" —
 * fazer isso seria fingir uma confirmação que não existe.
 */
export class ManualPixProvider implements PaymentProvider {
  readonly name = "manual_pix";

  async payPixCommission(request: PixPayoutRequest): Promise<PixPayoutResult> {
    return { status: "requires_manual_proof", providerTransactionId: request.idempotencyKey };
  }
}

export function getActivePaymentProvider(): PaymentProvider {
  return new ManualPixProvider();
}
