'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, isAdmin, signOut } from '@/lib/supabase/auth';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InventarioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const session = await getSession();

      if (!session) {
        // Not logged in
        router.push('/admin/login');
        return;
      }

      // Check if user is admin
      const isUserAdmin = await isAdmin(session.user.id);

      if (!isUserAdmin) {
        // Not authorized
        toast.error('Access denied. Admin privileges required.');
        router.push('/');
        return;
      }

      // Authenticated and authorized
      setAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: '#172e3c' }}
          ></div>
          <p className="text-lg font-light" style={{ color: '#172e3c' }}>
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Inventario - Joyería</h1>
          <div className="flex gap-4 items-center">
            <Link
              href="/"
              className="text-sm font-light hover:opacity-70 transition-opacity"
              style={{ color: '#172e3c' }}
            >
              View Store
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-light border hover:bg-gray-100 transition-colors"
              style={{ borderColor: '#d6e2e2', color: '#172e3c' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="pb-12">{children}</main>

      <footer className="bg-white border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          © 2024 Sistema de Inventario de Joyería
        </div>
      </footer>
    </div>
  );
}
