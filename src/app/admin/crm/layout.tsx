"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, isAdmin } from "@/lib/supabase/auth";
import { toast } from "sonner";
import Sidebar from "@/components/admin/Sidebar";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        router.push("/admin/login");
        return;
      }

      // Check if user is admin
      const isUserAdmin = await isAdmin(session.user.id);

      if (!isUserAdmin) {
        // Not authorized
        toast.error("Access denied. Admin privileges required.");
        router.push("/");
        return;
      }

      // Authenticated and authorized
      setAuthenticated(true);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
            style={{ borderColor: "#172e3c" }}
          ></div>
          <p className="text-lg font-light" style={{ color: "#172e3c" }}>
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6">{children}</main>
    </div>
  );
}
