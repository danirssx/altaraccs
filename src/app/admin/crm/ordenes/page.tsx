"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Order } from "@/types/orders";

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Statistics {
  totalOrigPrice: number;
  totalActualPrice: number;
  totalDiscount: number;
  discountPercentage: number;
}

export default function OrdenesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [statistics, setStatistics] = useState<Statistics>({
    totalOrigPrice: 0,
    totalActualPrice: 0,
    totalDiscount: 0,
    discountPercentage: 0,
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        search: searchQuery,
        page: currentPage.toString(),
        limit: "20",
      });

      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();

      setOrders(data.orders || []);
      setPagination(data.pagination);
      setStatistics(data.statistics || {
        totalOrigPrice: 0,
        totalActualPrice: 0,
        totalDiscount: 0,
        discountPercentage: 0,
      });
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
      month: "short",
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-light mb-2"
          style={{ color: "#172e3c", fontFamily: "Playfair Display, serif" }}
        >
          Órdenes
        </h1>
        <p className="text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
          Gestiona todas las órdenes de clientes
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o número de orden..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#172e3c]"
            style={{ borderColor: "#d6e2e2" }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: "#d6e2e2" }}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>

        {/* Create Order Button */}
        <Link
          href="/admin/crm/ordenes/crear"
          className="px-6 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90 whitespace-nowrap"
          style={{ backgroundColor: "#172e3c" }}
        >
          + Nueva Orden
        </Link>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="mb-4 text-sm" style={{ color: "#172e3c", opacity: 0.7 }}>
          Mostrando {orders.length} de {pagination.total} órdenes
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-20">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: "#172e3c" }}
          />
          <p className="mt-4 text-lg font-light" style={{ color: "#172e3c" }}>
            Cargando órdenes...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border" style={{ borderColor: "#d6e2e2" }}>
          <p className="text-lg font-light" style={{ color: "#172e3c" }}>
            No se encontraron órdenes
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-lg border overflow-hidden" style={{ borderColor: "#d6e2e2" }}>
            <table className="w-full">
              <thead style={{ backgroundColor: "#f9fafb" }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#172e3c" }}>
                    Orden #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#172e3c" }}>
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#172e3c" }}>
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#172e3c" }}>
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: "#172e3c" }}>
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: "#172e3c" }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "#d6e2e2" }}>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: "#172e3c" }}>
                        {order.order_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm" style={{ color: "#172e3c" }}>
                        {order.customer_name}
                      </div>
                      <div className="text-xs" style={{ color: "#172e3c", opacity: 0.6 }}>
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: "#172e3c" }}>
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
                          order.order_statuses?.code || ""
                        )}`}
                      >
                        {order.order_statuses?.name || "Desconocido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: "#172e3c" }}>
                        {formatCurrency(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/crm/ordenes/${order.id}`}
                        className="text-sm font-medium hover:opacity-70"
                        style={{ color: "#172e3c" }}
                      >
                        Ver detalles →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/crm/ordenes/${order.id}`}
                className="block bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                style={{ borderColor: "#d6e2e2" }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-sm" style={{ color: "#172e3c" }}>
                      {order.order_number}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(
                      order.order_statuses?.code || ""
                    )}`}
                  >
                    {order.order_statuses?.name}
                  </span>
                </div>
                <div className="text-sm mb-2" style={{ color: "#172e3c" }}>
                  {order.customer_name}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-medium" style={{ color: "#172e3c" }}>
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-xs" style={{ color: "#172e3c" }}>
                    Ver detalles →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg transition-all disabled:opacity-40"
                style={{ borderColor: "#d6e2e2", color: "#172e3c" }}
              >
                ← Anterior
              </button>

              <span className="px-4 py-2 text-sm" style={{ color: "#172e3c" }}>
                Página {currentPage} de {pagination.totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border rounded-lg transition-all disabled:opacity-40"
                style={{ borderColor: "#d6e2e2", color: "#172e3c" }}
              >
                Siguiente →
              </button>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-8 bg-white rounded-lg border p-6" style={{ borderColor: "#d6e2e2" }}>
            <h2 className="text-xl font-light mb-4" style={{ color: "#172e3c", fontFamily: "Playfair Display, serif" }}>
              Estadísticas de Órdenes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Original Price Total */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                  Precio Original Total
                </div>
                <div className="text-2xl font-medium" style={{ color: "#172e3c" }}>
                  {formatCurrency(statistics.totalOrigPrice)}
                </div>
              </div>

              {/* Actual Price Total */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#f9fafb" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#172e3c", opacity: 0.6 }}>
                  Precio Real Total
                </div>
                <div className="text-2xl font-medium" style={{ color: "#172e3c" }}>
                  {formatCurrency(statistics.totalActualPrice)}
                </div>
              </div>

              {/* Total Discount */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#f0fdf4" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#16a34a", opacity: 0.8 }}>
                  Descuento Total
                </div>
                <div className="text-2xl font-medium" style={{ color: "#16a34a" }}>
                  {formatCurrency(statistics.totalDiscount)}
                </div>
              </div>

              {/* Discount Percentage */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: "#f0fdf4" }}>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "#16a34a", opacity: 0.8 }}>
                  % Descuento
                </div>
                <div className="text-2xl font-medium" style={{ color: "#16a34a" }}>
                  {statistics.discountPercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
