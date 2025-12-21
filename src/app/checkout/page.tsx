'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/formatters';
import { sendOrderToWhatsApp } from '@/utils/whatsapp';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
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

      // Save order to database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();

      // Send to WhatsApp
      sendOrderToWhatsApp(orderData);

      // Clear cart
      clearCart();

      // Show success message
      toast.success('Order sent!', {
        description: 'Your order has been sent via WhatsApp. We\'ll be in touch shortly!',
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Error submitting order', {
        description: error instanceof Error ? error.message : 'Please try again',
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
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div>
            <form onSubmit={handleSubmit}>
              {/* Customer Information */}
              <div className="mb-8">
                <h2 className="text-xl font-light mb-4" style={{ color: '#172e3c' }}>
                  Customer Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                      Full Name *
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
                      Phone *
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
                  Delivery Option *
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
                      Store Pickup
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
                      Home Delivery
                    </span>
                  </label>
                </div>
              </div>

              {/* Shipping Address (conditional) */}
              {deliveryOption === 'delivery' && (
                <div className="mb-8">
                  <h2 className="text-xl font-light mb-4" style={{ color: '#172e3c' }}>
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-light mb-2" style={{ color: '#172e3c' }}>
                        Address Line 1 *
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
                          City *
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
                          State/Province *
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
                          Postal Code *
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
                          Country *
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
                  Order Notes (Optional)
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
                  placeholder="Any special requests or notes..."
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
                {submitting ? 'SENDING...' : 'SEND ORDER VIA WHATSAPP'}
              </button>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="border p-6" style={{ borderColor: '#d6e2e2', backgroundColor: '#f7f1e3' }}>
              <h2 className="text-xl font-light mb-6" style={{ color: '#172e3c' }}>
                Order Summary
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
                        Code: {item.productCode} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium" style={{ color: '#dbb58e' }}>
                        {formatPrice(item.price * item.quantity)}
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
                <div className="flex justify-between text-lg font-medium">
                  <span style={{ color: '#172e3c' }}>
                    Total
                  </span>
                  <span style={{ color: '#dbb58e' }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              {/* Back to Cart Link */}
              <Link
                href="/"
                className="block text-center mt-6 text-sm font-light hover:opacity-70 transition-opacity"
                style={{ color: '#172e3c' }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
