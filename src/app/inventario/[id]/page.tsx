import { redirect } from "next/navigation";
import { use } from "react";

export default function InventarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  redirect(`/admin/crm/productos/${id}`);
}
