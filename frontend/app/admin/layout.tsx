"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import api from "@/lib/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage first
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "admin") {
          console.log("No token or not admin, redirecting to login");
          router.replace("/auth/login");
          return;
        }

        console.log("Checking admin auth with API...");
        const res = await api.get("/auth/me");
        console.log("Admin auth response:", res.data);

        if (!res.data?.user || res.data.user.role !== "admin") {
          console.log("API auth failed or not admin, redirecting to login");
          // Clear invalid auth data
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.dispatchEvent(
            new CustomEvent("auth-change", { detail: { type: "logout" } }),
          );
          router.replace("/auth/login");
        } else {
          console.log("Admin auth successful");
          setLoading(false);
        }
      } catch (err) {
        console.error("ADMIN AUTH ERROR 👉", err);
        // On error, delay redirect to prevent rapid redirects
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.dispatchEvent(
            new CustomEvent("auth-change", { detail: { type: "logout" } }),
          );
          router.replace("/auth/login");
        }, 1000);
      }
    };

    // Small delay to ensure auth state is settled
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#0b0d17]">
      <aside className="hidden md:flex w-64">
        <AdminSidebar />
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
