'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { ProductType } from '@/types/database';
import { useState, useEffect, useRef } from 'react';
import { getProductTypes } from '@/lib/api/inventory';

export default function Header() {
  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadProductTypes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shopMenuRef.current && !shopMenuRef.current.contains(event.target as Node)) {
        setIsShopOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProductTypes = async () => {
    try {
      const types = await getProductTypes();
      setProductTypes(types);
    } catch (error) {
      console.error('Error loading product types:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-cream border-b" style={{ borderColor: '#d6e2e2' }}>
      <div className="container mx-auto px-4">
        {/* Main Header Row */}
        <div className="grid grid-cols-3 items-center py-4 gap-4">
          {/* Left Section - Desktop Navigation */}
          <div className="flex items-center justify-start">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#172e3c' }}
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Desktop Navigation - Left */}
            <nav className="hidden lg:flex items-center gap-8">
              {/* Shop Dropdown */}
              <div className="relative" ref={shopMenuRef}>
                <button
                  onClick={() => setIsShopOpen(!isShopOpen)}
                  className="flex items-center gap-1 text-sm tracking-[0.1em] uppercase font-light transition-opacity hover:opacity-70"
                  style={{ color: '#172e3c' }}
                >
                  Shop
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isShopOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isShopOpen && (
                  <div
                    className="absolute top-full left-0 mt-4 py-4 px-6 bg-white shadow-xl min-w-[200px] border"
                    style={{ borderColor: '#d6e2e2' }}
                  >
                    <Link
                      href="/showroom"
                      onClick={() => setIsShopOpen(false)}
                      className="block py-2 text-sm font-light transition-colors hover:opacity-70"
                      style={{ color: '#172e3c' }}
                    >
                      All Products
                    </Link>

                    <div className="border-t my-2" style={{ borderColor: '#d6e2e2' }} />

                    {productTypes.map((type) => (
                      <Link
                        key={type.id}
                        href={`/showroom?type=${type.id}`}
                        onClick={() => setIsShopOpen(false)}
                        className="block py-2 text-sm font-light transition-colors hover:opacity-70"
                        style={{ color: '#172e3c' }}
                      >
                        {type.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/showroom"
                className="text-sm tracking-[0.1em] uppercase font-light transition-opacity hover:opacity-70"
                style={{ color: '#172e3c' }}
              >
                Collection
              </Link>
            </nav>
          </div>

          {/* Center Section - Logo */}
          <div className="flex justify-center">
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logos/Altara.png"
                alt="Altara"
                width={160}
                height={50}
                priority
                className="object-contain"
              />
            </Link>
          </div>

          {/* Right Section - Cart */}
          <div className="flex items-center justify-end gap-4">
            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative flex items-center justify-center w-10 h-10 hover:opacity-70 transition-opacity"
              aria-label="Shopping cart"
            >
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

              {mounted && totalItems > 0 && (
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

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t py-4" style={{ borderColor: '#d6e2e2' }}>
            <nav className="space-y-4">
              <Link
                href="/showroom"
                onClick={() => setIsMenuOpen(false)}
                className="block text-sm tracking-[0.1em] uppercase font-light py-2"
                style={{ color: '#172e3c' }}
              >
                All Products
              </Link>

              <div className="border-t pt-4" style={{ borderColor: '#d6e2e2' }}>
                <p
                  className="text-xs tracking-[0.2em] uppercase mb-3"
                  style={{ color: '#dbb58e' }}
                >
                  Categories
                </p>
                {productTypes.map((type) => (
                  <Link
                    key={type.id}
                    href={`/showroom?type=${type.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-light py-2"
                    style={{ color: '#172e3c' }}
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
