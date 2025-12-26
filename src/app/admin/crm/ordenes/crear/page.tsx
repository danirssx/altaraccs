"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductVariant } from "@/types/database";
import { toast } from "sonner";

interface OrderItem {
  productVariantId: number;
  productName: string;
  productCode: number;
  quantity: number;
  price: number;
  availableStock: number;
}

export default function CrearOrdenPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"delivery" | "pickup">("delivery");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Venezuela");
  const [notes, setNotes] = useState("");

  // Order items and product search
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory");
      const data = await response.json();

      // Filter products with stock
      const productsWithStock = (data.data || []).filter(
        (p: ProductVariant) =>
          p.inventory_current && p.inventory_current.quantity > 0
      );

      setProducts(productsWithStock);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: ProductVariant) => {
    // Check if already added
    if (orderItems.some((item) => item.productVariantId === product.id)) {
      toast.error("Este producto ya está en la orden");
      return;
    }

    const newItem: OrderItem = {
      productVariantId: product.id,
      productName: product.product_groups?.name || "",
      productCode: product.code,
      quantity: 1,
      price: product.price,
      availableStock: product.inventory_current?.quantity || 0,
    };

    setOrderItems([...orderItems, newItem]);
    setSearchQuery("");
    setShowProductDropdown(false);
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return false;

    const searchLower = searchQuery.toLowerCase().trim();
    const productName = product.product_groups?.name?.toLowerCase() || "";
    const productCode = product.code.toString();
    const productId = product.id.toString();

    return (
      productName.includes(searchLower) ||
      productCode.includes(searchLower) ||
      productId.includes(searchLower)
    );
  });

  const removeProduct = (productVariantId: number) => {
    setOrderItems(orderItems.filter((item) => item.productVariantId !== productVariantId));
  };

  const updateQuantity = (productVariantId: number, quantity: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.productVariantId === productVariantId
          ? { ...item, quantity: Math.max(1, Math.min(quantity, item.availableStock)) }
          : item
      )
    );
  };

  const updatePrice = (productVariantId: number, price: number) => {
    setOrderItems(
      orderItems.map((item) =>
        item.productVariantId === productVariantId ? { ...item, price: Math.max(0, price) } : item
      )
    );
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customerName || !customerEmail || !customerPhone) {
      toast.error("Completa toda la información del cliente");
      return;
    }

    if (deliveryOption === "delivery" && (!addressLine1 || !city || !state)) {
      toast.error("Completa la dirección de envío");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Agrega al menos un producto a la orden");
      return;
    }

    try {
      setCreating(true);

      const requestBody = {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address:
            deliveryOption === "delivery"
              ? {
                  line1: addressLine1,
                  line2: addressLine2,
                  city,
                  state,
                  postalCode,
                  country,
                }
              : undefined,
        },
        items: orderItems.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryOption,
        notes,
      };

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Orden creada correctamente");
        router.push(`/admin/crm/ordenes/${data.order.id}`);
      } else {
        toast.error(data.error || "Error al crear la orden");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Error al crear la orden");
    } finally {
      setCreating(false);
    }
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
          Cargando productos...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/crm/ordenes"
          className="text-sm font-medium hover:opacity-70 mb-4 inline-block"
          style={{ color: "#172e3c" }}
        >
          ← Volver a órdenes
        </Link>
        <h1
          className="text-3xl font-light mb-2"
          style={{ color: "#172e3c", fontFamily: "Playfair Display, serif" }}
        >
          Crear Nueva Orden
        </h1>
        <p className="text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
          Crea una orden manual para un cliente
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg border p-6" style={{ borderColor: "#d6e2e2" }}>
          <h2 className="text-lg font-medium mb-4" style={{ color: "#172e3c" }}>
            Información del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                Nombre Completo *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "#d6e2e2" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                Email *
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "#d6e2e2" }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                Teléfono *
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: "#d6e2e2" }}
              />
            </div>
          </div>
        </div>

        {/* Delivery Option */}
        <div className="bg-white rounded-lg border p-6" style={{ borderColor: "#d6e2e2" }}>
          <h2 className="text-lg font-medium mb-4" style={{ color: "#172e3c" }}>
            Método de Entrega
          </h2>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="delivery"
                checked={deliveryOption === "delivery"}
                onChange={() => setDeliveryOption("delivery")}
                className="w-4 h-4"
                style={{ accentColor: "#172e3c" }}
              />
              <span style={{ color: "#172e3c" }}>Envío a Domicilio</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="pickup"
                checked={deliveryOption === "pickup"}
                onChange={() => setDeliveryOption("pickup")}
                className="w-4 h-4"
                style={{ accentColor: "#172e3c" }}
              />
              <span style={{ color: "#172e3c" }}>Retiro en Tienda</span>
            </label>
          </div>

          {/* Delivery Address */}
          {deliveryOption === "delivery" && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                  Dirección Línea 1 *
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required={deliveryOption === "delivery"}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: "#d6e2e2" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                  Dirección Línea 2
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{ borderColor: "#d6e2e2" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required={deliveryOption === "delivery"}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required={deliveryOption === "delivery"}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "#172e3c" }}>
                    País
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    style={{ borderColor: "#d6e2e2" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg border p-6" style={{ borderColor: "#d6e2e2" }}>
          <h2 className="text-lg font-medium mb-4" style={{ color: "#172e3c" }}>
            Productos
          </h2>

          {/* Add Product - Search Bar */}
          <div className="mb-6 relative" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowProductDropdown(e.target.value.trim().length > 0);
                }}
                onFocus={() => setShowProductDropdown(searchQuery.trim().length > 0)}
                placeholder="Buscar producto por nombre, código o ID..."
                className="w-full px-4 py-3 border rounded-lg pr-10"
                style={{ borderColor: "#d6e2e2" }}
              />
              <svg
                className="absolute right-3 top-3.5 w-5 h-5"
                style={{ color: "#172e3c", opacity: 0.5 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Product Dropdown */}
            {showProductDropdown && filteredProducts.length > 0 && (
              <div
                className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto"
                style={{ borderColor: "#d6e2e2" }}
              >
                {filteredProducts.slice(0, 10).map((product) => {
                  const primaryImage = product.product_images?.[0];
                  const isAlreadyAdded = orderItems.some(
                    (item) => item.productVariantId === product.id
                  );

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => !isAlreadyAdded && addProduct(product)}
                      disabled={isAlreadyAdded}
                      className={`w-full p-3 flex items-center gap-3 border-b last:border-b-0 text-left transition-colors ${
                        isAlreadyAdded
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : "hover:bg-gray-50"
                      }`}
                      style={{ borderColor: "#d6e2e2" }}
                    >
                      {/* Product Image */}
                      <div
                        className="w-12 h-12 rounded border flex-shrink-0 overflow-hidden"
                        style={{ borderColor: "#d6e2e2" }}
                      >
                        {primaryImage?.url_cloudinary ? (
                          <Image
                            src={primaryImage.url_cloudinary}
                            alt={product.product_groups?.name || ""}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg
                              className="w-6 h-6"
                              style={{ color: "#172e3c", opacity: 0.3 }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium truncate"
                          style={{ color: "#172e3c" }}
                        >
                          {product.product_groups?.name}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: "#172e3c", opacity: 0.6 }}
                        >
                          Código: {product.code} • ID: {product.id}
                          {product.size && ` • ${product.size}`}
                          {product.color && ` • ${product.color}`}
                        </div>
                      </div>

                      {/* Stock and Price */}
                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-sm font-medium"
                          style={{ color: "#172e3c" }}
                        >
                          {formatCurrency(product.price)}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{
                            color:
                              (product.inventory_current?.quantity || 0) > 0
                                ? "#10b981"
                                : "#ef4444",
                          }}
                        >
                          Stock: {product.inventory_current?.quantity || 0}
                        </div>
                      </div>

                      {isAlreadyAdded && (
                        <div
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: "#dbb58e",
                            color: "#fffff5",
                          }}
                        >
                          Agregado
                        </div>
                      )}
                    </button>
                  );
                })}

                {filteredProducts.length > 10 && (
                  <div
                    className="p-3 text-center text-sm"
                    style={{ color: "#172e3c", opacity: 0.6 }}
                  >
                    Mostrando 10 de {filteredProducts.length} resultados
                  </div>
                )}
              </div>
            )}

            {/* No Results */}
            {showProductDropdown && searchQuery.trim() && filteredProducts.length === 0 && (
              <div
                className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg p-4 text-center"
                style={{ borderColor: "#d6e2e2" }}
              >
                <p className="text-sm" style={{ color: "#172e3c", opacity: 0.6 }}>
                  No se encontraron productos
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          {orderItems.length === 0 ? (
            <div className="text-center py-8" style={{ color: "#172e3c", opacity: 0.6 }}>
              No hay productos agregados
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.productVariantId}
                  className="flex flex-col sm:flex-row gap-3 items-start p-4 border rounded-lg"
                  style={{ borderColor: "#d6e2e2" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium" style={{ color: "#172e3c" }}>
                      {item.productName}
                    </div>
                    <div className="text-sm mt-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                      Código: {item.productCode} • Stock: {item.availableStock}
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex flex-wrap gap-2 items-end">
                    <div className="flex-1 sm:flex-none">
                      <label className="text-xs block mb-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                        Cantidad
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={item.availableStock}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productVariantId, parseInt(e.target.value) || 1)
                        }
                        className="w-full sm:w-20 px-2 py-1 border rounded text-center"
                        style={{ borderColor: "#d6e2e2" }}
                      />
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <label className="text-xs block mb-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                        Precio
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updatePrice(item.productVariantId, parseFloat(e.target.value) || 0)
                        }
                        className="w-full sm:w-24 px-2 py-1 border rounded"
                        style={{ borderColor: "#d6e2e2" }}
                      />
                    </div>
                    <div className="flex-1 sm:flex-none text-left sm:text-right">
                      <div className="text-xs mb-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                        Subtotal
                      </div>
                      <div className="font-medium" style={{ color: "#172e3c" }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(item.productVariantId)}
                      className="text-red-600 hover:text-red-700 p-1.5"
                      title="Eliminar producto"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end pt-4 border-t" style={{ borderColor: "#d6e2e2" }}>
                <div className="text-right">
                  <div className="text-sm mb-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                    Total
                  </div>
                  <div className="text-2xl font-medium" style={{ color: "#172e3c" }}>
                    {formatCurrency(calculateTotal())}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border p-6" style={{ borderColor: "#d6e2e2" }}>
          <h2 className="text-lg font-medium mb-4" style={{ color: "#172e3c" }}>
            Notas (Opcional)
          </h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Notas internas sobre esta orden..."
            className="w-full px-4 py-2 border rounded-lg"
            style={{ borderColor: "#d6e2e2" }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Link
            href="/admin/crm/ordenes"
            className="px-6 py-2 border rounded-lg font-medium hover:opacity-70"
            style={{ borderColor: "#d6e2e2", color: "#172e3c" }}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={creating || orderItems.length === 0}
            className="px-6 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#172e3c" }}
          >
            {creating ? "Creando..." : "Crear Orden"}
          </button>
        </div>
      </form>
    </div>
  );
}
