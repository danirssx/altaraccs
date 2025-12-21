'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function Header() {
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 border-b bg-cream" style={{ borderColor: '#d6e2e2' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          {/* Left spacer for symmetry */}
          <div className="w-10"></div>

          {/* Centered Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logos/Altara.png"
              alt="Altara"
              width={180}
              height={60}
              priority
              className="object-contain"
            />
          </Link>

          {/* Cart Icon */}
          <button
            onClick={toggleCart}
            className="relative flex items-center justify-center w-10 h-10 hover:opacity-70 transition-opacity"
            aria-label="Shopping cart"
          >
            {/* Shopping Bag Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
              style={{ color: '#172e3c' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>

            {/* Item Count Badge */}
            {totalItems > 0 && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: '#dbb58e',
                  color: '#fffff5',
                }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
