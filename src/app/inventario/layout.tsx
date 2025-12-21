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

      <main className="pb-12">{children}</main>
    </div>
  );
}
