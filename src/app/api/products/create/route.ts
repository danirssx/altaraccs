import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CreateProductRequest {
  // Product Group fields
  groupName: string;
  groupDescription?: string;
  brandId: number;
  productTypeId: number;

  // Product Variant fields
  size?: string;
  color?: string;
  code: number;
  price: number;
  originalPrice?: number;
  salePrice?: number;
  composition?: string;

  // Inventory
  initialQuantity: number;
}

/**
 * Create a new product (product_group + product_variant + inventory)
 * Admin only endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductRequest = await request.json();

    // Validate required fields
    if (!body.groupName || !body.brandId || !body.productTypeId || !body.code || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: groupName, brandId, productTypeId, code, price" },
        { status: 400 }
      );
    }

    if (body.initialQuantity < 0) {
      return NextResponse.json(
        { error: "Initial quantity cannot be negative" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const { data: existingProduct } = await supabase
      .from("product_variants")
      .select("id, code")
      .eq("code", body.code)
      .single();

    if (existingProduct) {
      return NextResponse.json(
        { error: `Product code ${body.code} already exists` },
        { status: 400 }
      );
    }

    // Step 1: Create product_group
    const { data: productGroup, error: groupError } = await supabase
      .from("product_groups")
      .insert({
        name: body.groupName,
        description: body.groupDescription || null,
        brand_id: body.brandId,
        product_type_id: body.productTypeId,
      })
      .select()
      .single();

    if (groupError || !productGroup) {
      console.error("Error creating product group:", groupError);
      return NextResponse.json(
        { error: "Failed to create product group", details: groupError?.message },
        { status: 500 }
      );
    }

    // Step 2: Create product_variant
    const { data: productVariant, error: variantError } = await supabase
      .from("product_variants")
      .insert({
        product_group_id: productGroup.id,
        size: body.size || null,
        color: body.color || null,
        code: body.code,
        price: body.price,
        original_price: body.originalPrice || null,
        sale_price: body.salePrice || null,
        composition: body.composition || null,
      })
      .select()
      .single();

    if (variantError || !productVariant) {
      console.error("Error creating product variant:", variantError);
      // Rollback: delete product_group
      await supabase.from("product_groups").delete().eq("id", productGroup.id);

      return NextResponse.json(
        { error: "Failed to create product variant", details: variantError?.message },
        { status: 500 }
      );
    }

    // Step 3: Create inventory_current entry
    const { error: inventoryError } = await supabase
      .from("inventory_current")
      .insert({
        product_id: productVariant.id,
        quantity: body.initialQuantity,
      });

    if (inventoryError) {
      console.error("Error creating inventory:", inventoryError);
      // Rollback: delete product_variant and product_group
      await supabase.from("product_variants").delete().eq("id", productVariant.id);
      await supabase.from("product_groups").delete().eq("id", productGroup.id);

      return NextResponse.json(
        { error: "Failed to create inventory", details: inventoryError.message },
        { status: 500 }
      );
    }

    // Step 4: Create inventory_movement record if quantity > 0
    if (body.initialQuantity > 0) {
      await supabase.from("inventory_movements").insert({
        product_id: productVariant.id,
        movement_type: "IN",
        quantity: body.initialQuantity,
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: productVariant.id,
        groupId: productGroup.id,
        code: productVariant.code,
        name: productGroup.name,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/products/create:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
