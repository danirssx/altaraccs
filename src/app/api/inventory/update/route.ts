import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      product_id, 
      size, 
      color, 
      code, 
      price, 
      original_price, 
      sale_price, 
      composition, 
      quantity 
    } = body;

    // Update product variant
    const { error: variantError } = await supabaseAdmin
      .from('product_variants')
      .update({
        size: size || null,
        color: color || null,
        code,
        price,
        original_price: original_price || null,
        sale_price: sale_price || null,
        composition: composition || null,
      })
      .eq('id', product_id);

    if (variantError) {
      return NextResponse.json({ error: variantError.message }, { status: 400 });
    }

    // Update inventory
    const { error: inventoryError } = await supabaseAdmin
      .from('inventory_current')
      .upsert({
        product_id,
        quantity,
      });

    if (inventoryError) {
      return NextResponse.json({ error: inventoryError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}