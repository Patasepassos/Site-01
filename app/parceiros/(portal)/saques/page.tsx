import { redirect } from "next/navigation";

// Unificado em /parceiros/financeiro junto com Comissões e Saldo.
export default function SaquesPage() {
  redirect("/parceiros/financeiro");
}
