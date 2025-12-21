'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase/auth';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);

      toast.success('Login successful!');

      // Redirect to admin inventory page
      router.push('/inventario');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed', {
        description: error instanceof Error ? error.message : 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logos/Altara.png"
            alt="Altara"
            width={180}
            height={60}
            className="mx-auto mb-6"
          />
          <h1
            className="text-2xl font-light mb-2"
            style={{
              color: '#172e3c',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Admin Login
          </h1>
          <p className="text-sm font-light" style={{ color: '#172e3c', opacity: 0.7 }}>
            Sign in to access the inventory management system
          </p>
        </div>

        {/* Login Form */}
        <div className="border p-8" style={{ borderColor: '#d6e2e2', backgroundColor: '#fffff5' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-light mb-2"
                style={{ color: '#172e3c' }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border font-light focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#fffff5',
                  borderColor: '#d6e2e2',
                  color: '#172e3c',
                }}
                placeholder="admin@example.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-light mb-2"
                style={{ color: '#172e3c' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border font-light focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: '#fffff5',
                  borderColor: '#d6e2e2',
                  color: '#172e3c',
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-sm tracking-widest transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#172e3c',
                color: '#fffff5',
              }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Back to Store Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm font-light hover:opacity-70 transition-opacity"
            style={{ color: '#172e3c' }}
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
