'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Newsletter Section */}
          <div className="lg:col-span-1">
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
          <div className="lg:col-span-1 flex flex-col">
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

          {/* Products Column */}
          <div>
            <h3 className="text-lg font-light mb-4" style={{ color: '#172e3c' }}>
              Products
            </h3>
            <ul className="space-y-2">
              {['Earrings', 'Necklace', 'Bracelet', 'Ring', 'Brooche', "Men's Jewelry"].map((item) => (
                <li key={item}>
                  <Link
                    href="/"
                    className="text-sm font-light hover:opacity-70 transition-opacity"
                    style={{ color: '#172e3c' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-lg font-light mb-4" style={{ color: '#172e3c' }}>
              Company
            </h3>
            <ul className="space-y-2">
              {[
                'About Us',
                'Testimonials',
                'Best Seller',
                'New Arrivals',
                'Terms & Conditions',
                'Latest Update',
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm font-light hover:opacity-70 transition-opacity"
                    style={{ color: '#172e3c' }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-lg font-light mb-4" style={{ color: '#172e3c' }}>
              Support
            </h3>
            <ul className="space-y-2">
              {[
                'Size Charts',
                'Payment Guide',
                'Help Centre',
                'Privacy Policy',
                'Return Policy',
                'FAQs',
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm font-light hover:opacity-70 transition-opacity"
                    style={{ color: '#172e3c' }}
                  >
                    {item}
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
          <div className="flex gap-4 text-sm font-light" style={{ color: '#172e3c' }}>
            <Link href="#" className="hover:opacity-70">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="#" className="hover:opacity-70">
              Terms & Condition
            </Link>
            <span>|</span>
            <Link href="#" className="hover:opacity-70">
              Sitemap
            </Link>
          </div>
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
