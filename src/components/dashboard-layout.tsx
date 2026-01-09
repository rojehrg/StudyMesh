"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  ChevronLeft,
  HamburgerLg,
  LogOut,
  Users,
} from "react-coolicons";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingTour } from "@/components/onboarding-tour";
import { RealtimeProvider, useRealtime } from "@/components/realtime-provider";
import { CelebrationProvider } from "@/components/celebration-provider";

interface SidebarItemProps {
  icon: any;
  label: string;
  href: string;
  isCollapsed: boolean;
  isActive: boolean;
  isPending?: boolean;
  onClick?: () => void;
  badge?: number;
}

function SidebarItem({ icon: Icon, label, href, isCollapsed, isActive, isPending, onClick, badge }: SidebarItemProps) {
  const showActive = isActive || isPending;

  return (
    <Link
      href={href}
      prefetch={true}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-100 overflow-hidden whitespace-nowrap group",
        showActive
          ? "bg-coffee-cream/70 text-coffee-espresso font-medium"
          : "text-coffee-cortado hover:bg-coffee-cream/40 hover:text-coffee-mocha"
      )}
      title={isCollapsed ? label : ""}
    >
      <div className="relative flex items-center">
        <Icon className={cn("w-[18px] h-[18px] shrink-0", isPending && "animate-pulse")} />
        {badge ? (
          <span className={cn(
            "absolute -top-1.5 -right-1.5 bg-coffee-mocha text-coffee-paper text-[10px] font-bold min-w-[16px] h-[16px] flex items-center justify-center px-1 rounded-full z-10",
            !isCollapsed && "hidden"
          )}>
            {badge > 9 ? '9+' : badge}
          </span>
        ) : null}
      </div>

      <motion.span
        initial={false}
        animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden whitespace-nowrap text-sm"
      >
        {label}
      </motion.span>

      {!isCollapsed && badge ? (
        <span className="ml-auto bg-coffee-mocha text-coffee-paper text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

// Base layout component (doesn't use realtime hooks)
function DashboardLayoutBase({
  children,
  profile,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  pathname,
  handleLogout,
  unreadCount = 0,
  userId
}: {
  children: React.ReactNode;
  profile: any;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  pathname: string;
  handleLogout: () => void;
  unreadCount?: number;
  userId?: string;
}) {
  const supabase = createClient();
  const [orgName, setOrgName] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Clear pending path when pathname changes (navigation complete)
  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  // Fetch organization name
  useEffect(() => {
    const loadOrgName = async () => {
      if (!userId) return;
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id, organizations(name)')
        .eq('user_id', userId)
        .maybeSingle();

      if (orgMember?.organizations) {
        setOrgName((orgMember.organizations as any).name);
      }
    };
    loadOrgName();
  }, [userId, supabase]);

  // Minimal sidebar for Slack-first experience
  // Users do everything in Slack - web is just for settings
  const navItems: Array<{ icon: any; label: string; href: string; badge?: number }> = [
    { icon: Users, label: "Team", href: "/team" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div
      className="flex min-h-screen bg-coffee-paper"
      style={{ fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif' }}
    >
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-coffee-espresso/30 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 bg-white border-r border-coffee-foam transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Attunly" className={cn(
              "shrink-0 transition-all duration-300",
              isCollapsed ? "w-8 h-8" : "w-6 h-6"
            )} />
            <motion.span
              initial={false}
              animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
              className="whitespace-nowrap overflow-hidden text-lg font-semibold text-coffee-espresso"
            >
              attunly
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
              isActive={pathname === item.href || (item.href === "/notifications" && pathname === "/notifications")}
              isPending={pendingPath === item.href}
              onClick={() => {
                if (pathname !== item.href) {
                  setPendingPath(item.href);
                  setIsMobileOpen(false);
                }
              }}
              badge={item.badge}
            />
          ))}
        </nav>

        {/* Sidebar Bottom Section - Org Name only */}
        {userId && orgName && !isCollapsed && (
          <div className="pb-2 px-3">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 py-2 rounded-lg bg-coffee-cream/40"
            >
              <p className="text-[10px] uppercase tracking-wider text-coffee-latte">Organization</p>
              <p className="text-sm text-coffee-mocha truncate">{orgName}</p>
            </motion.div>
          </div>
        )}

        {/* User Profile */}
        <div className="p-3 border-t border-coffee-foam/50">
          <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-coffee-cream/40 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-coffee-foam text-coffee-mocha text-sm font-medium">
                {profile?.first_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <motion.div
              initial={false}
              animate={{
                width: isCollapsed ? 0 : "auto",
                opacity: isCollapsed ? 0 : 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden flex items-center flex-1"
            >
              <p className="text-sm text-coffee-mocha truncate flex-1">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : "User"}
              </p>

              <button
                onClick={handleLogout}
                className="text-coffee-latte hover:text-coffee-mocha p-1 rounded transition-colors active:scale-95 shrink-0"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Header - Fixed positioning */}
        <header className={cn(
          "h-12 bg-coffee-paper/95 backdrop-blur-sm flex items-center justify-between px-4 fixed top-0 right-0 z-30",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
        )}>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="md:hidden text-coffee-mocha hover:bg-coffee-cream/50 h-8 w-8">
              <HamburgerLg className="w-5 h-5" />
            </Button>
            <span className="ml-2 font-semibold text-base md:hidden text-coffee-espresso">
              attunly
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle hidden for now - using light mode */}
          </div>
        </header>

        {/* Page Content - Add top margin for fixed header */}
        <main className="flex-1 px-6 md:px-8 pb-6 md:pb-8 overflow-x-hidden mt-12 pt-4">
          <CelebrationProvider>
            {children}
          </CelebrationProvider>
        </main>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "hidden md:flex fixed top-1/2 -translate-y-1/2 z-40",
          "bg-white border border-coffee-foam",
          "rounded-r-lg p-1.5 shadow-sm hover:shadow-md",
          "text-coffee-cortado hover:text-coffee-espresso transition-all duration-300 active:scale-95",
          isCollapsed ? "left-[5rem]" : "left-[16rem]"
        )}
      >
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )} />
      </button>

      {/* Onboarding Tour for New Users */}
      <OnboardingTour />

    </div>
  );
}

// Wrapper that uses realtime context (only rendered when provider exists)
function DashboardLayoutWithRealtime({
  children,
  profile,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  pathname,
  handleLogout,
  userId
}: {
  children: React.ReactNode;
  profile: any;
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  pathname: string;
  handleLogout: () => void;
  userId: string;
}) {
  const { newNotificationCount } = useRealtime();
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  // Load initial unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      setUnreadCount(count || 0);
    };
    loadUnreadCount();
  }, [supabase]);

  // Update count when new notifications arrive
  useEffect(() => {
    if (newNotificationCount > 0) {
      setUnreadCount(prev => prev + newNotificationCount);
    }
  }, [newNotificationCount]);

  return (
    <DashboardLayoutBase
      profile={profile}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isMobileOpen={isMobileOpen}
      setIsMobileOpen={setIsMobileOpen}
      pathname={pathname}
      handleLogout={handleLogout}
      unreadCount={unreadCount}
      userId={userId}
    >
      {children}
    </DashboardLayoutBase>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();


  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn("Could not load profile:", error.message);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Force a hard navigation to clear any cached state
    window.location.href = "/login";
  };

  // Wrap everything in RealtimeProvider when userId is available
  if (userId) {
    return (
      <RealtimeProvider userId={userId}>
        <DashboardLayoutWithRealtime
          profile={profile}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          pathname={pathname}
          handleLogout={handleLogout}
          userId={userId}
        >
          {children}
        </DashboardLayoutWithRealtime>
      </RealtimeProvider>
    );
  }

  // Render without RealtimeProvider while loading (no realtime hooks)
  return (
    <DashboardLayoutBase
      profile={profile}
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      isMobileOpen={isMobileOpen}
      setIsMobileOpen={setIsMobileOpen}
      pathname={pathname}
      handleLogout={handleLogout}
      unreadCount={0}
    >
      {children}
    </DashboardLayoutBase>
  );
}

