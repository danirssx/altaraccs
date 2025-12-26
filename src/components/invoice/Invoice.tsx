import { Order } from "@/types/orders";
import Image from "next/image";

interface InvoiceProps {
  order: Order;
}

export default function Invoice({ order }: InvoiceProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div
      className="bg-white p-12 max-w-4xl mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Header with Logo */}
      <div
        className="flex justify-between items-start mb-12 pb-6 border-b-2"
        style={{ borderColor: "#172e3c" }}
      >
        <div>
          <div className="mb-4">
            <Image
              src="/logos/Altara.png"
              alt="Altara"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="text-right">
          <h1
            className="text-3xl font-light mb-2"
            style={{ color: "#172e3c", fontFamily: "Playfair Display, serif" }}
          >
            FACTURA
          </h1>
          <p className="text-sm mb-1" style={{ color: "#172e3c" }}>
            <strong>No. Orden:</strong> {order.order_number}
          </p>
          <p className="text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
            <strong>Fecha:</strong> {formatDate(order.created_at)}
          </p>
        </div>
      </div>

      {/* Customer & Order Info */}
      <div className="grid grid-cols-2 gap-8 mb-12">
        {/* Bill To */}
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: "#dbb58e" }}
          >
            Facturar a
          </h2>
          <div className="text-sm space-y-1" style={{ color: "#172e3c" }}>
            <p className="font-medium text-base">{order.customer_name}</p>
            <p>{order.customer_email}</p>
            <p>{order.customer_phone}</p>
          </div>
        </div>

        {/* Ship To */}
        {order.ship_address_line1 && (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#dbb58e" }}
            >
              Enviar a
            </h2>
            <div className="text-sm space-y-1" style={{ color: "#172e3c" }}>
              <p className="font-medium">
                {order.ship_full_name || order.customer_name}
              </p>
              <p>{order.ship_address_line1}</p>
              {order.ship_address_line2 && <p>{order.ship_address_line2}</p>}
              <p>
                {order.ship_city}, {order.ship_state} {order.ship_postal_code}
              </p>
              <p>{order.ship_country}</p>
            </div>
          </div>
        )}

        {/* Pickup Notice */}
        {order.ship_notes?.includes("Pickup") && !order.ship_address_line1 && (
          <div>
            <h2
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#dbb58e" }}
            >
              Método de Entrega
            </h2>
            <div className="text-sm" style={{ color: "#172e3c" }}>
              <p className="font-medium">Retiro en Tienda</p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items Table */}
      <div className="mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2" style={{ borderColor: "#172e3c" }}>
              <th
                className="text-left py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#172e3c" }}
              >
                Producto
              </th>
              <th
                className="text-center py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#172e3c" }}
              >
                Cantidad
              </th>
              <th
                className="text-right py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#172e3c" }}
              >
                Precio Unit.
              </th>
              <th
                className="text-right py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "#172e3c" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item) => (
              <tr
                key={item.id}
                className="border-b"
                style={{ borderColor: "#d6e2e2" }}
              >
                <td className="py-4">
                  <div>
                    <p className="font-medium" style={{ color: "#172e3c" }}>
                      {item.product_variants?.product_groups?.name ||
                        item.title_snapshot}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "#172e3c", opacity: 0.6 }}
                    >
                      Código: {item.product_variants?.code || item.sku_snapshot}
                      {item.product_variants?.size &&
                        ` • ${item.product_variants.size}`}
                      {item.product_variants?.color &&
                        ` • ${item.product_variants.color}`}
                    </p>
                  </div>
                </td>
                <td className="py-4 text-center" style={{ color: "#172e3c" }}>
                  {item.qty}
                </td>
                <td className="py-4 text-right" style={{ color: "#172e3c" }}>
                  {formatCurrency(item.unit_price)}
                </td>
                <td
                  className="py-4 text-right font-medium"
                  style={{ color: "#172e3c" }}
                >
                  {formatCurrency(item.line_subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-80">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: "#172e3c", opacity: 0.7 }}>Subtotal:</span>
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
            {order.tax_total > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: "#172e3c", opacity: 0.7 }}>
                  Impuestos:
                </span>
                <span style={{ color: "#172e3c" }}>
                  {formatCurrency(order.tax_total)}
                </span>
              </div>
            )}
          </div>
          <div
            className="flex justify-between text-xl font-medium pt-4 border-t-2"
            style={{ borderColor: "#172e3c", color: "#172e3c" }}
          >
            <span>Total:</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t" style={{ borderColor: "#d6e2e2" }}>
        <div className="text-center space-y-2">
          <p className="text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
            Gracias por su compra
          </p>
          <p className="text-xs" style={{ color: "#172e3c", opacity: 0.6 }}>
            Para consultas sobre esta factura, contacte con nosotros citando el
            número de orden
          </p>
        </div>
      </div>
    </div>
  );
}
