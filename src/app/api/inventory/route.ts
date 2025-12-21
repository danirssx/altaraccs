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
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
