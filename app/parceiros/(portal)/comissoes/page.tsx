import { redirect } from "next/navigation";

// Unificado em /parceiros/financeiro junto com Saldo e Saques.
export default function ComissoesPage() {
  redirect("/parceiros/financeiro");
}
