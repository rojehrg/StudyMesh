"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loading, MoreGridBig, UsersGroup, Building01, TrendingUp, LogOut, ChevronLeft } from "react-coolicons";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUserEmail(user.email || null);

      // Check if user is admin (via environment variable list or org owner)
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || [];
      const isAdmin = adminEmails.includes(user.email?.toLowerCase() || "");

      if (!isAdmin) {
        // Check if user owns any organization
        const { data: orgs } = await supabase
          .from("organizations")
          .select("id")
          .eq("owner_id", user.id)
          .limit(1);

        if (!orgs || orgs.length === 0) {
          router.replace("/dashboard");
          return;
        }
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Admin access check failed:", error);
      router.replace("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const navItems = [
    { icon: MoreGridBig, label: "Overview", href: "/admin" },
    { icon: Building01, label: "Organizations", href: "/admin/organizations" },
    { icon: UsersGroup, label: "Users", href: "/admin/users" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/analytics" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="h-14 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to App</span>
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-900">Admin Console</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 fixed top-14 left-0 bottom-0 z-40">
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-56 mt-14 p-6">
        {children}
      </main>
    </div>
  );
}
