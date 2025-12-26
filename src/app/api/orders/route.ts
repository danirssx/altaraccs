import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OrderItem {
  productId: number;
  productName: string;
  productCode: number;
  price: number;
  quantity: number;
  imageUrl: string;
  size?: string;
  color?: string;
}

interface OrderRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryOption: 'delivery' | 'pickup';
  address?: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  total: number;
  notes?: string;
}

/**
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    const body: OrderRequest = await request.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryOption,
      address,
      items,
      total,
      notes,
    } = body;

    // Validation
    if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create "pending" order status
    const { data: pendingStatus, error: statusError } = await supabase
      .from('order_statuses')
      .select('id')
      .eq('code', 'pending')
      .single();

    if (statusError || !pendingStatus) {
      return NextResponse.json(
        { error: 'Order status not found. Please run database migrations.' },
        { status: 500 }
      );
    }

    // Generate order number (simple timestamp-based)
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        status_id: pendingStatus.id,
        currency: 'USD',
        subtotal: total,
        discount_total: 0,
        shipping_total: 0,
        tax_total: 0,
        total: total,
        ship_full_name: deliveryOption === 'delivery' ? customerName : null,
        ship_address_line1: address?.line1 || null,
        ship_city: address?.city || null,
        ship_state: address?.state || null,
        ship_postal_code: address?.postalCode || null,
        ship_country: address?.country || null,
        ship_notes: deliveryOption === 'pickup' ? 'Store Pickup' : notes || null,
        order_number: orderNumber,
        notes_internal: `Delivery option: ${deliveryOption}. ${notes || ''}`,
        placed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_variant_id: item.productId,
      qty: item.quantity,
      unit_price: item.price,
      unit_original_price: item.price,
      unit_sale_price: item.price,
      title_snapshot: item.productName,
      sku_snapshot: item.productCode.toString(),
      line_subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Note: Order was created but items failed
      // In production, you might want to rollback or handle this differently
    }

    // Create order status history
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: order.id,
        from_status_id: null,
        to_status_id: pendingStatus.id,
        reason: 'Order placed via website',
        meta: {
          delivery_option: deliveryOption,
          customer_notes: notes || null,
        },
      });

    if (historyError) {
      console.error('Error creating order status history:', historyError);
      // Non-critical error, continue
    }

    // Return success response
    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: 'Order created successfully',
    });

  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get all orders with filters (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let query = supabase
      .from('orders')
      .select(`
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
        )
      `, { count: 'exact' });

    // Apply status filter
    if (status && status !== 'all') {
      const { data: statusData } = await supabase
        .from('order_statuses')
        .select('id')
        .eq('code', status)
        .single();

      if (statusData) {
        query = query.eq('status_id', statusData.id);
      }
    }

    // Apply search filter
    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Apply sorting
    query = query.order('created_at', { ascending: false });

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics for filtered orders
    let statsQuery = supabase
      .from('orders')
      .select('orig_price, total');

    // Apply same filters as main query
    if (status && status !== 'all') {
      const { data: statusData } = await supabase
        .from('order_statuses')
        .select('id')
        .eq('code', status)
        .single();

      if (statusData) {
        statsQuery = statsQuery.eq('status_id', statusData.id);
      }
    }

    if (search) {
      statsQuery = statsQuery.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,order_number.ilike.%${search}%`);
    }

    const { data: statsData } = await statsQuery;

    // Calculate totals
    const statistics = {
      totalOrigPrice: statsData?.reduce((sum, order) => sum + (Number(order.orig_price) || 0), 0) || 0,
      totalActualPrice: statsData?.reduce((sum, order) => sum + (Number(order.total) || 0), 0) || 0,
    };

    statistics.totalDiscount = statistics.totalOrigPrice - statistics.totalActualPrice;
    statistics.discountPercentage = statistics.totalOrigPrice > 0
      ? ((statistics.totalDiscount / statistics.totalOrigPrice) * 100)
      : 0;

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      statistics,
    });

  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
