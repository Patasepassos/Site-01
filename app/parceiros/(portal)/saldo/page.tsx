import { redirect } from "next/navigation";

// Unificado em /parceiros/financeiro junto com Comissões e Saques.
export default function SaldoPage() {
  redirect("/parceiros/financeiro");
}
