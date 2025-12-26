"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { Order } from "@/types/orders";
import { toast } from "sonner";
import Invoice from "@/components/invoice/Invoice";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Factura-${order?.order_number || "orden"}`,
  });

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      const data = await response.json();

      if (data.order) {
        setOrder(data.order);
        setSelectedStatus(data.order.order_statuses?.code || "");
      } else {
        toast.error("Orden no encontrada");
        router.push("/admin/crm/ordenes");
      }
    } catch (error) {
      console.error("Error loading order:", error);
      toast.error("Error al cargar la orden");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.order_statuses?.code) {
      return;
    }

    if (selectedStatus === "confirmed") {
      const confirmed = window.confirm(
        "¿Confirmar esta orden? Se deducirá el inventario automáticamente.",
      );
      if (!confirmed) return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Estado actualizado correctamente");
        loadOrder(); // Reload to get updated data
      } else {
        toast.error(data.error || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (statusCode: string) => {
    switch (statusCode) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#172e3c" }}
        />
        <p className="mt-4 text-lg font-light" style={{ color: "#172e3c" }}>
          Cargando orden...
        </p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/crm/ordenes"
          className="text-sm font-medium hover:opacity-70 mb-4 inline-block"
          style={{ color: "#172e3c" }}
        >
          ← Volver a órdenes
        </Link>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1
              className="text-3xl font-light mb-2"
              style={{
                color: "#172e3c",
                fontFamily: "Playfair Display, serif",
              }}
            >
              Orden {order.order_number}
            </h1>
            <p className="text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
              Creada el {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full border ${getStatusBadgeColor(
                order.order_statuses?.code || "",
              )}`}
            >
              {order.order_statuses?.name}
            </span>
            {(order.order_statuses?.code === "confirmed" ||
              order.order_statuses?.code === "delivered") && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-all hover:opacity-70"
                style={{ borderColor: "#172e3c", color: "#172e3c" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Descargar Factura
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Productos
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start pb-4 border-b last:border-b-0"
                  style={{ borderColor: "#d6e2e2" }}
                >
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: "#172e3c" }}>
                      {item.product_variants?.product_groups?.name ||
                        item.title_snapshot}
                    </div>
                    <div
                      className="text-sm mt-1"
                      style={{ color: "#172e3c", opacity: 0.6 }}
                    >
                      Código: {item.product_variants?.code || item.sku_snapshot}
                      {item.product_variants?.size &&
                        ` • Talla: ${item.product_variants.size}`}
                      {item.product_variants?.color &&
                        ` • Color: ${item.product_variants.color}`}
                    </div>
                    <div
                      className="text-sm mt-1"
                      style={{ color: "#172e3c", opacity: 0.6 }}
                    >
                      Cantidad: {item.qty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium" style={{ color: "#172e3c" }}>
                      {formatCurrency(item.line_subtotal)}
                    </div>
                    <div
                      className="text-sm"
                      style={{ color: "#172e3c", opacity: 0.6 }}
                    >
                      {formatCurrency(item.unit_price)} c/u
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div
              className="mt-6 pt-4 border-t space-y-2"
              style={{ borderColor: "#d6e2e2" }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: "#172e3c", opacity: 0.7 }}>
                  Subtotal:
                </span>
                <span style={{ color: "#172e3c" }}>
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#172e3c", opacity: 0.7 }}>
                    Descuento:
                  </span>
                  <span style={{ color: "#172e3c" }}>
                    -{formatCurrency(order.discount_total)}
                  </span>
                </div>
              )}
              {order.shipping_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: "#172e3c", opacity: 0.7 }}>Envío:</span>
                  <span style={{ color: "#172e3c" }}>
                    {formatCurrency(order.shipping_total)}
                  </span>
                </div>
              )}
              <div
                className="flex justify-between text-lg font-medium pt-2 border-t"
                style={{ borderColor: "#d6e2e2", color: "#172e3c" }}
              >
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Order History */}
          {order.order_status_history &&
            order.order_status_history.length > 0 && (
              <div
                className="bg-white rounded-lg border p-6"
                style={{ borderColor: "#d6e2e2" }}
              >
                <h2
                  className="text-lg font-medium mb-4"
                  style={{ color: "#172e3c" }}
                >
                  Historial de Estados
                </h2>
                <div className="space-y-3">
                  {order.order_status_history.map((history) => (
                    <div key={history.id} className="flex gap-4">
                      <div
                        className="text-sm"
                        style={{ color: "#172e3c", opacity: 0.6 }}
                      >
                        {formatDate(history.created_at)}
                      </div>
                      <div className="flex-1">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#172e3c" }}
                        >
                          {history.from_status?.name || "Nuevo"} →{" "}
                          {history.to_status?.name}
                        </div>
                        {history.reason && (
                          <div
                            className="text-sm mt-1"
                            style={{ color: "#172e3c", opacity: 0.6 }}
                          >
                            {history.reason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Actualizar Estado
            </h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              style={{ borderColor: "#d6e2e2" }}
              disabled={updating}
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              {/*<option value="delivered">Entregado</option>*/}
              <option value="cancelled">Cancelado</option>
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={
                updating || selectedStatus === order.order_statuses?.code
              }
              className="w-full px-4 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#172e3c" }}
            >
              {updating ? "Actualizando..." : "Actualizar Estado"}
            </button>
            {selectedStatus === "confirmed" &&
              order.order_statuses?.code !== "confirmed" && (
                <p className="mt-2 text-xs" style={{ color: "#dbb58e" }}>
                  ⚠️ Se deducirá el inventario al confirmar
                </p>
              )}
          </div>

          {/* Customer Info */}
          <div
            className="bg-white rounded-lg border p-6"
            style={{ borderColor: "#d6e2e2" }}
          >
            <h2
              className="text-lg font-medium mb-4"
              style={{ color: "#172e3c" }}
            >
              Cliente
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <div style={{ color: "#172e3c", opacity: 0.6 }}>Nombre:</div>
                <div style={{ color: "#172e3c" }}>{order.customer_name}</div>
              </div>
              <div>
                <div style={{ color: "#172e3c", opacity: 0.6 }}>Email:</div>
                <div style={{ color: "#172e3c" }}>{order.customer_email}</div>
              </div>
              <div>
                <div style={{ color: "#172e3c", opacity: 0.6 }}>Teléfono:</div>
                <div style={{ color: "#172e3c" }}>{order.customer_phone}</div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {order.ship_address_line1 && (
            <div
              className="bg-white rounded-lg border p-6"
              style={{ borderColor: "#d6e2e2" }}
            >
              <h2
                className="text-lg font-medium mb-4"
                style={{ color: "#172e3c" }}
              >
                Dirección de Envío
              </h2>
              <div className="text-sm space-y-1" style={{ color: "#172e3c" }}>
                <div>{order.ship_full_name}</div>
                <div>{order.ship_address_line1}</div>
                {order.ship_address_line2 && (
                  <div>{order.ship_address_line2}</div>
                )}
                <div>
                  {order.ship_city}, {order.ship_state} {order.ship_postal_code}
                </div>
                <div>{order.ship_country}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes_internal && (
            <div
              className="bg-white rounded-lg border p-6"
              style={{ borderColor: "#d6e2e2" }}
            >
              <h2
                className="text-lg font-medium mb-4"
                style={{ color: "#172e3c" }}
              >
                Notas Internas
              </h2>
              <div
                className="text-sm"
                style={{ color: "#172e3c", opacity: 0.7 }}
              >
                {order.notes_internal}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Invoice for Printing */}
      <div className="hidden">
        <div ref={invoiceRef}>
          <Invoice order={order} />
        </div>
      </div>
    </div>
  );
}
