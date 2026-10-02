import { redirect } from "next/navigation";

// Unificado em /admin/financeiro junto com Comissões.
export default function AdminSaquesPage() {
  redirect("/admin/financeiro");
}
