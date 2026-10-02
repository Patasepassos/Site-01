import { redirect } from "next/navigation";

// Unificado em /admin/financeiro junto com Saques.
export default function AdminComissoesPage() {
  redirect("/admin/financeiro");
}
