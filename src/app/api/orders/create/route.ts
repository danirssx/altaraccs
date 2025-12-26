import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Create manual order (admin only)
 * Different from public /api/orders POST - allows custom pricing and admin-only access
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, items, deliveryOption, notes } = body;

    // Validate required fields
    if (!customer?.name || !customer?.email || !customer?.phone) {
      return NextResponse.json(
        { error: "Customer name, email, and phone are required" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one order item is required" },
        { status: 400 }
      );
    }

    // Validate stock availability for all items
    for (const item of items) {
      const { data: inventory } = await supabase
        .from("inventory_current")
        .select("quantity")
        .eq("product_id", item.productVariantId)
        .single();

      if (!inventory || inventory.quantity < item.quantity) {
        // Get product name for better error message
        const { data: product } = await supabase
          .from("product_variants")
          .select(
            `
            code,
            product_groups(name)
          `
          )
          .eq("id", item.productVariantId)
          .single();

        return NextResponse.json(
          {
            error: `Insufficient stock for ${product?.product_groups?.name || `product ${item.productVariantId}`}. Available: ${inventory?.quantity || 0}, Required: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Get pending status
    const { data: pendingStatus, error: statusError } = await supabase
      .from("order_statuses")
      .select("id")
      .eq("code", "pending")
      .single();

    if (statusError || !pendingStatus) {
      return NextResponse.json(
        { error: "Pending status not found in database" },
        { status: 500 }
      );
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        status_id: pendingStatus.id,
        currency: "USD",
        subtotal: total,
        discount_total: 0,
        shipping_total: 0,
        tax_total: 0,
        total: total,
        ship_full_name: deliveryOption === "delivery" ? customer.name : null,
        ship_address_line1: customer.address?.line1 || null,
        ship_address_line2: customer.address?.line2 || null,
        ship_city: customer.address?.city || null,
        ship_state: customer.address?.state || null,
        ship_postal_code: customer.address?.postalCode || null,
        ship_country: customer.address?.country || null,
        ship_notes: deliveryOption === "pickup" ? "Store Pickup" : notes || null,
        order_number: orderNumber,
        notes_internal: `Created manually by admin. ${notes || ""}`,
        placed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items with product snapshots
    const orderItemsData = await Promise.all(
      items.map(async (item: any) => {
        // Get product details for snapshot
        const { data: product } = await supabase
          .from("product_variants")
          .select(
            `
            code,
            product_groups(name)
          `
          )
          .eq("id", item.productVariantId)
          .single();

        return {
          order_id: order.id,
          product_variant_id: item.productVariantId,
          qty: item.quantity,
          unit_price: item.price,
          unit_original_price: item.price,
          unit_sale_price: item.price,
          title_snapshot: product?.product_groups?.name || "",
          sku_snapshot: product?.code?.toString() || "",
          line_subtotal: item.price * item.quantity,
        };
      })
    );

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      return NextResponse.json(
        {
          error: "Failed to create order items",
          details: itemsError.message,
        },
        { status: 500 }
      );
    }

    // Create status history
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status_id: null,
      to_status_id: pendingStatus.id,
      reason: "Order created manually by admin",
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/orders/create:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
