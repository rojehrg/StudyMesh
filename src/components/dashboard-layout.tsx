"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  BookOpen,
  UsersThree,
  PlusCircle,
  SignIn,
  Gear,
  Info,
  CaretLeft,
  List,
  SignOut,
  CalendarBlank,
  Bell
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NudgesDropdown } from "@/components/nudges-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingTour } from "@/components/onboarding-tour";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { RealtimeProvider } from "@/components/realtime-provider";
import { CelebrationProvider } from "@/components/celebration-provider";

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
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 overflow-hidden whitespace-nowrap group",
        isActive
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
      title={isCollapsed ? label : ""}
    >
      <div className="relative flex items-center">
        <Icon className="w-5 h-5 shrink-0" weight="duotone" />
        {badge ? (
          <span className={cn(
            "absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10",
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
        <span className="ml-auto bg-accent/20 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      ) : null}
    </Link>
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

  // Enable global keyboard shortcuts
  useGlobalShortcuts();

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

  const navItems: Array<{ icon: any; label: string; href: string; badge?: number }> = [
    { icon: SquaresFour, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Pods", href: "/classes" },
    { icon: Bell, label: "Nudges", href: "/notifications" },
    { icon: CalendarBlank, label: "Meetings", href: "/meetings" },
    { icon: PlusCircle, label: "Create Pod", href: "/classes/create" },
    { icon: SignIn, label: "Join Pod", href: "/classes/join" },
    { icon: Gear, label: "Settings", href: "/settings" },
    { icon: Info, label: "About Attunly", href: "/about" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
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
          "fixed inset-y-0 left-0 z-30 bg-card shadow-lg transition-all duration-300 ease-in-out flex flex-col",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/icon.png" alt="Attunly" className={cn(
              "shrink-0 transition-all duration-300",
              isCollapsed ? "w-10 h-10" : "w-7 h-7"
            )} />
            <motion.span
              initial={false}
              animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
              className="whitespace-nowrap overflow-hidden text-xl font-bold"
            >
              <span className="text-foreground">Attun</span>
              <span className="text-primary">ly</span>
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
        <div className="p-3">
          <div className="flex items-center p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
            <Avatar className="h-9 w-9">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {profile?.first_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <motion.div
              initial={false}
              animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
              className="ml-3 overflow-hidden"
            >
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : "User"}
              </p>
            </motion.div>

            <motion.button
              onClick={handleLogout}
              initial={false}
              animate={{
                marginLeft: isCollapsed ? 0 : "auto",
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : "auto"
              }}
              className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors active:scale-95"
              title="Logout"
            >
              <SignOut className="w-4 h-4" weight="duotone" />
            </motion.button>
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
          "h-14 bg-card/95 backdrop-blur-sm shadow-sm flex items-center justify-between px-4 fixed top-0 right-0 z-30 border-b border-border/50",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
        )}>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="md:hidden">
              <List className="w-6 h-6 text-foreground" weight="duotone" />
            </Button>
            <span className="ml-3 font-bold text-lg md:hidden">
              <span className="text-foreground">Attun</span>
              <span className="text-primary">ly</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NudgesDropdown />
          </div>
        </header>

        {/* Page Content - Add top margin for fixed header */}
        <main className="flex-1 px-6 md:px-8 pb-6 md:pb-8 overflow-x-hidden mt-14 pt-6">
          <CelebrationProvider>
            {userId ? (
              <RealtimeProvider userId={userId}>
                {children}
              </RealtimeProvider>
            ) : (
              children
            )}
          </CelebrationProvider>
        </main>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "hidden md:flex fixed top-1/2 -translate-y-1/2 z-40",
          "bg-card",
          "rounded-r-lg p-1.5 shadow-lg hover:shadow-xl",
          "text-muted-foreground hover:text-primary transition-all duration-300 active:scale-95",
          isCollapsed ? "left-[5rem]" : "left-[16rem]"
        )}
      >
        <CaretLeft className={cn(
          "w-4 h-4 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )} weight="duotone" />
      </button>

      {/* Onboarding Tour for New Users */}
      <OnboardingTour />

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsHelp />
    </div>
  );
}

