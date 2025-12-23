'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/formatters';
import { sendOrderToWhatsApp } from '@/utils/whatsapp';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useCurrency } from '@/contexts/CurrencyContext';
import { formatCurrency, convertToVes } from '@/utils/currency';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { currency, exchangeRate } = useCurrency();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('pickup');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [notes, setNotes] = useState('');

  const subtotal = getTotalPrice();

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare order data
      const orderData = {
        customerName,
        customerEmail,
        customerPhone,
        deliveryOption,
        address: deliveryOption === 'delivery' ? {
          line1: addressLine1,
          city,
          state,
          postalCode,
          country,
        } : undefined,
        items,
        total: subtotal,
        notes,
      };

      // Send to WhatsApp first (primary action)
      try {
        sendOrderToWhatsApp(orderData);
      } catch (whatsappError) {
        console.error('Error sending to WhatsApp:', whatsappError);
        toast.error('Error al abrir WhatsApp', {
          description: 'Por favor verifica que tienes WhatsApp instalado',
        });
        setSubmitting(false);
        return;
      }

      // Try to save order to database (optional, don't block if it fails)
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          console.error('Failed to save order to database, but WhatsApp message was sent');
        }
      } catch (dbError) {
        console.error('Database error (non-critical):', dbError);
        // Continue anyway since WhatsApp is the primary channel
      }

      // Clear cart
      clearCart();

      // Show success message
      toast.success('¡Pedido enviado!', {
        description: 'Tu pedido ha sido enviado por WhatsApp. ¡Nos pondremos en contacto pronto!',
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Error al enviar el pedido', {
        description: error instanceof Error ? error.message : 'Por favor intenta de nuevo',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1
          className="text-3xl md:text-4xl font-light mb-8 text-center"
          style={{
            color: '#172e3c',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Customer Information */}
              <div className="mb-8">
                <h2 className="text-xl font-light mb-4" style={{ color: '#172e3c' }}>
                  Información del Cliente
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border font-light"
                      style={{
                        backgroundColor: '#fffff5',
                        borderColor: '#d6e2e2',
                        color: '#172e3c',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border font-light"
                      style={{
                        backgroundColor: '#fffff5',
                        borderColor: '#d6e2e2',
                        color: '#172e3c',
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 border font-light"
                      style={{
                        backgroundColor: '#fffff5',
                        borderColor: '#d6e2e2',
                        color: '#172e3c',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="mb-8">
                <h2 className="text-xl font-light mb-4" style={{ color: '#172e3c' }}>
                  Opción de Entrega *
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: deliveryOption === 'pickup' ? '#dbb58e' : '#d6e2e2' }}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="pickup"
                      checked={deliveryOption === 'pickup'}
                      onChange={(e) => setDeliveryOption(e.target.value as 'pickup')}
                      className="w-4 h-4"
                    />
                    <span className="font-light" style={{ color: '#172e3c' }}>
                      Recoger en Tienda
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ borderColor: deliveryOption === 'delivery' ? '#dbb58e' : '#d6e2e2' }}>
                    <input
                      type="radio"
                      name="deliveryOption"
                      value="delivery"
                      checked={deliveryOption === 'delivery'}
                      onChange={(e) => setDeliveryOption(e.target.value as 'delivery')}
                      className="w-4 h-4"
                    />
                    <span className="font-light" style={{ color: '#172e3c' }}>
                      Entrega a Domicilio
                    </span>
                  </label>
                </div>
              </div>

              {/* Shipping Address (conditional) */}
              {deliveryOption === 'delivery' && (
                <div className="mb-8">
                  <h2 className="text-xl font-light mb-4" style={{ color: '#172e3c' }}>
                    Dirección de Envío
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                        Dirección Línea 1 *
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required={deliveryOption === 'delivery'}
                        className="w-full px-4 py-3 border font-light"
                        style={{
                          backgroundColor: '#fffff5',
                          borderColor: '#d6e2e2',
                          color: '#172e3c',
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required={deliveryOption === 'delivery'}
                          className="w-full px-4 py-3 border font-light"
                          style={{
                            backgroundColor: '#fffff5',
                            borderColor: '#d6e2e2',
                            color: '#172e3c',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                          Estado/Provincia *
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required={deliveryOption === 'delivery'}
                          className="w-full px-4 py-3 border font-light"
                          style={{
                            backgroundColor: '#fffff5',
                            borderColor: '#d6e2e2',
                            color: '#172e3c',
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                          Código Postal *
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required={deliveryOption === 'delivery'}
                          className="w-full px-4 py-3 border font-light"
                          style={{
                            backgroundColor: '#fffff5',
                            borderColor: '#d6e2e2',
                            color: '#172e3c',
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                          País *
                        </label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required={deliveryOption === 'delivery'}
                          className="w-full px-4 py-3 border font-light"
                          style={{
                            backgroundColor: '#fffff5',
                            borderColor: '#d6e2e2',
                            color: '#172e3c',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div className="mb-8">
                <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                  Notas del Pedido (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border font-light"
                  style={{
                    backgroundColor: '#fffff5',
                    borderColor: '#d6e2e2',
                    color: '#172e3c',
                  }}
                  placeholder="Cualquier solicitud o nota especial..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 text-sm tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#172e3c',
                  color: '#fffff5',
                }}
              >
                {submitting ? 'ENVIANDO...' : 'ENVIAR PEDIDO POR WHATSAPP'}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="border p-6" style={{ borderColor: '#d6e2e2', backgroundColor: '#f7f1e3' }}>
              <h2 className="text-xl font-light mb-6" style={{ color: '#172e3c' }}>
                Resumen del Pedido
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative w-20 h-20 flex-shrink-0 bg-white">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-light mb-1" style={{ color: '#172e3c' }}>
                        {item.productName}
                      </h3>
                      <p className="text-xs font-light mb-2" style={{ color: '#172e3c', opacity: 0.6 }}>
                        Código: {item.productCode} | Cant: {item.quantity}
                      </p>
                      <p className="text-sm font-medium" style={{ color: '#dbb58e' }}>
                        {formatCurrency(item.price * item.quantity, currency, exchangeRate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3" style={{ borderColor: '#d6e2e2' }}>
                <div className="flex justify-between">
                  <span className="font-light" style={{ color: '#172e3c' }}>
                    Subtotal
                  </span>
                  <span className="font-light" style={{ color: '#172e3c' }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Show both currencies */}
                <div className="space-y-2 py-3 border-t" style={{ borderColor: '#d6e2e2' }}>
                  <div className="flex justify-between text-lg font-medium">
                    <span style={{ color: '#172e3c' }}>
                      Total (USD)
                    </span>
                    <span style={{ color: '#dbb58e' }}>
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>

                  {exchangeRate && (
                    <div className="flex justify-between text-lg font-medium">
                      <span style={{ color: '#172e3c' }}>
                        Total (Bs.)
                      </span>
                      <span style={{ color: '#dbb58e' }}>
                        Bs. {convertToVes(subtotal, exchangeRate).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </span>
                    </div>
                  )}

                  {/* Exchange rate note */}
                  {exchangeRate && (
                    <p className="text-xs font-light pt-2" style={{ color: '#172e3c', opacity: 0.7 }}>
                      * Tasa BCV Euro: Bs. {exchangeRate.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Back to Cart Link */}
              <Link
                href="/"
                className="block text-center mt-6 text-sm font-light hover:opacity-70 transition-opacity"
                style={{ color: '#172e3c' }}
              >
                ← Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
