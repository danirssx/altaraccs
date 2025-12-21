'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ProductType } from '@/types/database';
import { getProductTypes } from '@/lib/api/inventory';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    try {
      const types = await getProductTypes();
      setProductTypes(types);
    } catch (error) {
      console.error('Error loading product types:', error);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer className="border-t mt-20 bg-cream-dark" style={{ borderColor: '#d6e2e2' }}>
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Newsletter Section */}
          <div>
            <h3 className="text-lg font-light mb-4" style={{ color: '#172e3c' }}>
              Newsletter
            </h3>
            <p className="text-sm font-light mb-4" style={{ color: '#172e3c', opacity: 0.8 }}>
              Get our latest news and promo updates directly to your email address every month.
            </p>
            <form onSubmit={handleSubscribe} className="mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address ..."
                className="w-full px-4 py-2 mb-3 border text-sm font-light"
                style={{
                  backgroundColor: '#fffff5',
                  borderColor: '#d6e2e2',
                  color: '#172e3c',
                }}
                required
              />
              <button
                type="submit"
                className="w-full py-2 text-sm tracking-widest transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: '#dbb58e',
                  color: '#172e3c',
                }}
              >
                SUBSCRIBE
              </button>
            </form>
            {/* Social Media Links */}
            <div className="flex gap-4">
              <a href="#" className="text-sm font-light hover:opacity-70" style={{ color: '#172e3c' }}>
                FB
              </a>
              <a href="#" className="text-sm font-light hover:opacity-70" style={{ color: '#172e3c' }}>
                IG
              </a>
              <a href="#" className="text-sm font-light hover:opacity-70" style={{ color: '#172e3c' }}>
                TW
              </a>
            </div>
          </div>

          {/* Logo & Contact Info */}
          <div className="flex flex-col">
            <Link href="/" className="mb-6">
              <Image
                src="/logos/Altara.png"
                alt="Altara"
                width={150}
                height={50}
                className="object-contain"
              />
            </Link>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ color: '#dbb58e' }}>📍</span>
                <div className="text-sm font-light" style={{ color: '#172e3c' }}>
                  <p className="font-medium">Location</p>
                  <p className="opacity-80">123 Main Street Chicago, IL</p>
                  <p className="opacity-80">60601 United States</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ color: '#dbb58e' }}>📞</span>
                <div className="text-sm font-light" style={{ color: '#172e3c' }}>
                  <p className="font-medium">Phone</p>
                  <p className="opacity-80">+1 (234) 567 890</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm" style={{ color: '#dbb58e' }}>✉️</span>
                <div className="text-sm font-light" style={{ color: '#172e3c' }}>
                  <p className="font-medium">E-Mail</p>
                  <p className="opacity-80">support@altara.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Products Column - Dynamic from product types */}
          <div>
            <h3 className="text-lg font-light mb-4" style={{ color: '#172e3c' }}>
              Products
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/showroom"
                  className="text-sm font-light hover:opacity-70 transition-opacity"
                  style={{ color: '#172e3c' }}
                >
                  All Products
                </Link>
              </li>
              {productTypes.map((type) => (
                <li key={type.id}>
                  <Link
                    href={`/showroom?type=${type.id}`}
                    className="text-sm font-light hover:opacity-70 transition-opacity"
                    style={{ color: '#172e3c' }}
                  >
                    {type.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderColor: '#d6e2e2' }}
        >
          <div className="flex gap-3">
            {['VS', 'MC', 'AP', 'PP'].map((method) => (
              <div
                key={method}
                className="px-3 py-1 text-xs font-medium border rounded"
                style={{
                  borderColor: '#d6e2e2',
                  color: '#172e3c',
                }}
              >
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-sm font-light" style={{ color: '#172e3c', opacity: 0.7 }}>
            © {new Date().getFullYear()} Altara. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
