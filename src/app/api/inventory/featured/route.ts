import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("product_variants")
            .select(
                `
        *,
        is_featured,
        product_groups(
          *,
          brands(name),
          product_types(name)
        ),
        product_images(alt_text, sort_order, url_cloudinary),
        inventory_current(quantity)
      `,
            )
            .eq("is_featured", true)
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Filter to only include products with valid images and stock
        const validProducts = (data || []).filter((product) => {
            if (!product.product_images || product.product_images.length === 0) {
                return false;
            }
            const primaryImage = product.product_images[0];
            if (!primaryImage?.url_cloudinary?.includes("cloudinary.com")) {
                return false;
            }
            if (!product.inventory_current || product.inventory_current.quantity <= 0) {
                return false;
            }
            return true;
        });

        return NextResponse.json({ data: validProducts });
    } catch (_error) {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
