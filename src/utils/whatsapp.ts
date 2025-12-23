import { CartItem } from '@/store/cartStore';

export interface OrderData {
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
  items: CartItem[];
  total: number;
  notes?: string;
}

/**
 * Formats order data into a WhatsApp message
 */
export function formatWhatsAppMessage(order: OrderData): string {
  const lines: string[] = [];

  // Header
  lines.push('🛍️ *NUEVO PEDIDO*');
  lines.push('');

  // Customer Info
  lines.push('*Cliente:*');
  lines.push(`Nombre: ${order.customerName}`);
  lines.push(`Email: ${order.customerEmail}`);
  lines.push(`Teléfono: ${order.customerPhone}`);
  lines.push('');

  // Delivery Option
  const deliveryText = order.deliveryOption === 'delivery' ? 'Entrega a Domicilio' : 'Recoger en Tienda';
  lines.push(`*Entrega:* ${deliveryText}`);

  if (order.deliveryOption === 'delivery' && order.address) {
    lines.push(`Dirección: ${order.address.line1}`);
    lines.push(`${order.address.city}, ${order.address.state} ${order.address.postalCode}`);
    lines.push(order.address.country);
  }
  lines.push('');

  // Products
  lines.push('*Productos:*');
  order.items.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    lines.push(
      `${index + 1}. ${item.productName} (Código: ${item.productCode}) x${item.quantity} - $${itemTotal.toFixed(2)}`
    );
  });
  lines.push('');

  // Total
  lines.push(`*Total:* $${order.total.toFixed(2)}`);

  // Notes
  if (order.notes && order.notes.trim()) {
    lines.push('');
    lines.push(`*Notas:* ${order.notes}`);
  }

  return lines.join('\n');
}

/**
 * Opens WhatsApp with a pre-filled message
 */
export function sendToWhatsApp(message: string): void {
  const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER;

  console.log('Attempting to send WhatsApp message...');
  console.log('Business number configured:', businessNumber ? 'Yes' : 'No');

  if (!businessNumber) {
    console.error('WhatsApp business number not configured');
    console.error('Please set NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER in your .env file');
    throw new Error('Número de WhatsApp no configurado. Por favor contacta al administrador.');
  }

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

  console.log('Opening WhatsApp URL:', whatsappUrl);

  // Open in new window/tab
  const newWindow = window.open(whatsappUrl, '_blank');

  if (!newWindow) {
    console.error('Failed to open WhatsApp window - popup may be blocked');
    throw new Error('No se pudo abrir WhatsApp. Por favor permite ventanas emergentes.');
  }

  console.log('WhatsApp window opened successfully');
}

/**
 * Formats order and sends to WhatsApp
 */
export function sendOrderToWhatsApp(order: OrderData): void {
  const message = formatWhatsAppMessage(order);
  sendToWhatsApp(message);
}
