import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Get single order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_statuses!status_id (*),
        order_items (
          *,
          product_variants (
            id,
            code,
            size,
            color,
            product_groups (name)
          )
        ),
        order_status_history (
          *,
          from_status:order_statuses!from_status_id (code, name),
          to_status:order_statuses!to_status_id (code, name)
        )
      `
      )
      .eq("id", id)
      .order("created_at", {
        ascending: false,
        foreignTable: "order_status_history",
      })
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error in GET /api/orders/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Update order (status, customer info, notes)
 * CRITICAL: Handles inventory deduction when status changes to 'confirmed'
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status: newStatusCode, customerInfo, notes } = body;

    // Fetch current order with all details
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_statuses!status_id(*),
        order_items(*)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Handle status change to 'confirmed' with inventory deduction
    if (
      newStatusCode === "confirmed" &&
      currentOrder.order_statuses.code !== "confirmed"
    ) {
      // Get confirmed status ID
      const { data: confirmedStatus, error: statusError } = await supabase
        .from("order_statuses")
        .select("id")
        .eq("code", "confirmed")
        .single();

      if (statusError || !confirmedStatus) {
        return NextResponse.json(
          { error: "Confirmed status not found in database" },
          { status: 500 }
        );
      }

      // Check and deduct inventory for each item
      for (const item of currentOrder.order_items) {
        // Get current inventory
        const { data: currentInventory, error: invError } = await supabase
          .from("inventory_current")
          .select("quantity")
          .eq("product_id", item.product_variant_id)
          .single();

        if (invError) {
          return NextResponse.json(
            {
              error: `Failed to check inventory for product ${item.product_variant_id}`,
            },
            { status: 500 }
          );
        }

        if (!currentInventory || currentInventory.quantity < item.qty) {
          return NextResponse.json(
            {
              error: `Insufficient stock for product ${item.product_variant_id}. Available: ${currentInventory?.quantity || 0}, Required: ${item.qty}`,
            },
            { status: 400 }
          );
        }

        // Deduct from inventory_current
        const { error: updateError } = await supabase
          .from("inventory_current")
          .update({
            quantity: currentInventory.quantity - item.qty,
            updated_at: new Date().toISOString(),
          })
          .eq("product_id", item.product_variant_id);

        if (updateError) {
          return NextResponse.json(
            {
              error: `Failed to update inventory for product ${item.product_variant_id}`,
            },
            { status: 500 }
          );
        }

        // Create inventory_movement record
        const { error: movementError } = await supabase
          .from("inventory_movements")
          .insert({
            product_id: item.product_variant_id,
            movement_type: "OUT",
            quantity: item.qty,
            created_at: new Date().toISOString(),
          });

        if (movementError) {
          console.error("Failed to create inventory movement:", movementError);
          // Don't fail the request, just log
        }
      }

      // Update order status
      const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({ status_id: confirmedStatus.id })
        .eq("id", id);

      if (orderUpdateError) {
        return NextResponse.json(
          { error: "Failed to update order status" },
          { status: 500 }
        );
      }

      // Create status history
      await supabase.from("order_status_history").insert({
        order_id: currentOrder.id,
        from_status_id: currentOrder.status_id,
        to_status_id: confirmedStatus.id,
        reason: "Order confirmed - inventory deducted",
      });
    } else if (
      newStatusCode &&
      newStatusCode !== currentOrder.order_statuses.code
    ) {
      // Status change without inventory deduction
      const { data: newStatus, error: statusError } = await supabase
        .from("order_statuses")
        .select("id")
        .eq("code", newStatusCode)
        .single();

      if (statusError || !newStatus) {
        return NextResponse.json(
          { error: `Status '${newStatusCode}' not found` },
          { status: 400 }
        );
      }

      await supabase
        .from("orders")
        .update({ status_id: newStatus.id })
        .eq("id", id);

      await supabase.from("order_status_history").insert({
        order_id: currentOrder.id,
        from_status_id: currentOrder.status_id,
        to_status_id: newStatus.id,
        reason: `Status changed to ${newStatusCode}`,
      });
    }

    // Update customer info if provided
    if (customerInfo) {
      await supabase
        .from("orders")
        .update({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
        })
        .eq("id", id);
    }

    // Update notes if provided
    if (notes !== undefined) {
      await supabase
        .from("orders")
        .update({ notes_internal: notes })
        .eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in PATCH /api/orders/[id]:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
