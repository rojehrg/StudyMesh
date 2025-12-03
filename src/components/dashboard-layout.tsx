"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Bell, 
  PlusCircle, 
  LogIn, 
  Settings, 
  Info, 
  ChevronLeft, 
  Menu, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  isCollapsed: boolean;
  isActive: boolean;
  badge?: number;
}

function SidebarItem({ icon: Icon, label, href, isCollapsed, isActive, badge }: SidebarItemProps) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-300 overflow-hidden whitespace-nowrap group",
        isActive
          ? "bg-teal-50 text-teal-700 border-teal-200 shadow-sm"
          : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      )}
      title={isCollapsed ? label : ""}
    >
      <div className="relative flex items-center">
        <Icon className="w-5 h-5 shrink-0" />
        {badge ? (
          <span className={cn(
            "absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10",
            !isCollapsed && "hidden"
          )}>
            {badge}
          </span>
        ) : null}
      </div>
      
      <motion.span
        initial={false}
        animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden whitespace-nowrap font-medium"
      >
        {label}
      </motion.span>
      
      {!isCollapsed && badge ? (
        <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems: Array<{ icon: any; label: string; href: string; badge?: number }> = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Pods", href: "/classes" },
    { icon: Users, label: "Working Circles", href: "/groups" },
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: PlusCircle, label: "Create Pod", href: "/classes/create" },
    { icon: LogIn, label: "Join Pod", href: "/classes/join" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Info, label: "About Meshflow", href: "/about" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
            <span className={cn(
              "text-teal-600 text-xl font-bold shrink-0 transition-all duration-300",
              isCollapsed ? "w-12 text-center" : ""
            )}>
              M
            </span>
            <motion.span
              initial={false}
              animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <span className="text-teal-600 text-xl font-bold">esh</span>
              <span className="text-gray-900 text-xl font-bold">flow</span>
            </motion.span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isCollapsed={isCollapsed}
              isActive={pathname === item.href}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <Avatar className="h-9 w-9 border-2 border-teal-100">
              <AvatarImage src="" />
              <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">U</AvatarFallback>
            </Avatar>
            
            <motion.div
              initial={false}
              animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
              className="ml-3 overflow-hidden"
            >
              <p className="text-sm font-medium text-gray-900 truncate">User Name</p>
              <p className="text-xs text-gray-500 truncate">user@example.com</p>
            </motion.div>

            <motion.button
              onClick={handleLogout}
              initial={false}
              animate={{ 
                marginLeft: isCollapsed ? 0 : "auto", 
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto"
              }}
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg transition-colors active:scale-95"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Header (Mobile Toggle) */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:hidden sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </Button>
          <span className="ml-3 font-bold text-lg">Meshflow</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "hidden md:flex fixed top-1/2 -translate-y-1/2 z-40",
          "bg-white border border-l-0 border-gray-200",
          "rounded-r-lg p-1.5 shadow-lg hover:shadow-xl",
          "text-gray-500 hover:text-teal-600 transition-all duration-300 active:scale-95",
          isCollapsed ? "left-[5rem]" : "left-[16rem]"
        )}
      >
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )} />
      </button>
    </div>
  );
}

