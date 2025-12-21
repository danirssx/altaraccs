'use client';

import { useCartStore } from '@/store/cartStore';
import CartItem from './CartItem';
import { formatPrice } from '@/utils/formatters';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();

  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when cart is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-2xl flex flex-col transform transition-transform"
        style={{
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#d6e2e2' }}>
          <h2 className="text-xl font-light" style={{ fontFamily: 'Playfair Display, serif', color: '#172e3c' }}>
            Shopping Cart
          </h2>
          <button
            onClick={closeCart}
            className="hover:opacity-70 transition-opacity"
            style={{ color: '#172e3c' }}
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-16 h-16 mb-4"
                style={{ color: '#d6e2e2' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
              <p className="text-lg font-light mb-2" style={{ color: '#172e3c' }}>
                Your cart is empty
              </p>
              <p className="text-sm font-light mb-6" style={{ color: '#172e3c', opacity: 0.7 }}>
                Add some beautiful pieces to get started
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-3 text-sm tracking-widest transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#172e3c',
                  color: '#fffff5',
                }}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            <div className="py-4">
              {items.map((item) => (
                <CartItem
                  key={item.productId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - only show when cart has items */}
        {items.length > 0 && (
          <div className="border-t p-6" style={{ borderColor: '#d6e2e2' }}>
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-light" style={{ color: '#172e3c' }}>
                Subtotal
              </span>
              <span className="text-xl font-medium" style={{ color: '#dbb58e' }}>
                {formatPrice(subtotal)}
              </span>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full py-4 text-center text-sm tracking-widest transition-opacity hover:opacity-90 mb-3"
              style={{
                backgroundColor: '#172e3c',
                color: '#fffff5',
              }}
            >
              PROCEED TO CHECKOUT
            </Link>

            {/* Continue Shopping */}
            <button
              onClick={closeCart}
              className="w-full py-3 text-sm tracking-wider transition-all border-2"
              style={{
                borderColor: '#172e3c',
                color: '#172e3c',
                backgroundColor: 'transparent',
              }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
