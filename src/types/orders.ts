export interface OrderStatus {
  id: number;
  code: "pending" | "confirmed" | "delivered" | "cancelled";
  name: string;
  description?: string;
  sort_order: number;
  is_terminal: boolean;
  created_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_variant_id: number;
  qty: number;
  unit_price: number;
  unit_original_price?: number;
  unit_sale_price?: number;
  title_snapshot?: string;
  sku_snapshot?: string;
  line_subtotal: number;
  created_at?: string;
  product_variants?: {
    id: number;
    code: number;
    size?: string;
    color?: string;
    product_groups?: {
      name: string;
    };
  };
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  from_status_id?: number;
  to_status_id: number;
  reason?: string;
  actor_uid?: string;
  actor_name?: string;
  created_at: string;
  meta?: Record<string, unknown>;
  from_status?: OrderStatus;
  to_status?: OrderStatus;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_uid?: string;
  status_id: number;
  currency: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  ship_full_name?: string;
  ship_address_line1?: string;
  ship_address_line2?: string;
  ship_city?: string;
  ship_state?: string;
  ship_postal_code?: string;
  ship_country?: string;
  ship_notes?: string;
  bill_full_name?: string;
  bill_address_line1?: string;
  bill_address_line2?: string;
  bill_city?: string;
  bill_state?: string;
  bill_postal_code?: string;
  bill_country?: string;
  notes_internal?: string;
  placed_at?: string;
  paid_at?: string;
  canceled_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  order_statuses?: OrderStatus;
  order_items?: OrderItem[];
  order_status_history?: OrderStatusHistory[];
}

export interface OrderFilters {
  status?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateOrderRequest {
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  items: {
    productVariantId: number;
    quantity: number;
    price: number;
  }[];
  deliveryOption: "delivery" | "pickup";
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: "pending" | "confirmed" | "delivered" | "cancelled";
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: string;
}
