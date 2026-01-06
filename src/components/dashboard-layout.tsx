"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MoreGridBig,
  BookOpen,
  UsersGroup,
  AddPlusCircle,
  Exit,
  Settings,
  ChevronLeft,
  HamburgerLg,
  LogOut,
  Calendar,
  Bell
} from "react-coolicons";
import { HandHelping } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NudgesDropdown } from "@/components/nudges-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingTour } from "@/components/onboarding-tour";
import { KeyboardShortcutsHelp } from "@/components/keyboard-shortcuts-help";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { RealtimeProvider, useRealtime } from "@/components/realtime-provider";
import { CelebrationProvider } from "@/components/celebration-provider";

// AI Match icon component
function AiMatchIcon() {
  return (
    <img src="/ai-search.svg" alt="" className="w-6 h-6" />
  );
}

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
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-100 overflow-hidden whitespace-nowrap group",
        showActive
          ? "bg-muted text-foreground font-medium border-l-2 border-primary"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent"
      )}
      title={isCollapsed ? label : ""}
    >
      <div className="relative flex items-center">
        <Icon className={cn("w-5 h-5 shrink-0", isPending && "animate-pulse")} />
        {badge ? (
          <span className={cn(
            "absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full z-10 shadow-sm",
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
        className="overflow-hidden whitespace-nowrap font-medium"
      >
        {label}
      </motion.span>

      {!isCollapsed && badge ? (
        <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-full shadow-sm">
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
  const totalUnread = unreadCount;
  const supabase = createClient();
  const [isLookingToHelp, setIsLookingToHelp] = useState(profile?.availability?.lookingToHelp || false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Clear pending path when pathname changes (navigation complete)
  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  // Update looking to help status
  const handleLookingToHelpToggle = async (checked: boolean) => {
    if (!userId) return;
    try {
      const currentAvailability = profile?.availability || {};
      await supabase
        .from('profiles')
        .update({
          availability: { ...currentAvailability, lookingToHelp: checked }
        })
        .eq('user_id', userId);
      setIsLookingToHelp(checked);
      toast.success(checked ? "You're visible as looking to help!" : "Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

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

  const navItems: Array<{ icon: any; label: string; href: string; badge?: number }> = [
    { icon: MoreGridBig, label: "Dashboard", href: "/dashboard" },
    { icon: AiMatchIcon, label: "AI Match", href: "/find-help" },
    { icon: BookOpen, label: "Pods", href: "/classes" },
    { icon: Bell, label: "Nudges", href: "/notifications", badge: totalUnread > 0 ? totalUnread : undefined },
    { icon: Calendar, label: "Meetings", href: "/meetings" },
    { icon: AddPlusCircle, label: "Create Pod", href: "/classes/create" },
    { icon: Exit, label: "Join Pod", href: "/classes/join" },
    { icon: Settings, label: "Settings", href: "/settings" },
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

        {/* Sidebar Bottom Section - Org Name + Looking to Help */}
        {userId && (
          <div className={cn("pb-2 space-y-3", isCollapsed ? "px-2" : "px-3")}>
            {/* Organization Name - only show when expanded */}
            {orgName && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 py-2 rounded-xl bg-muted/50 border border-border/50"
              >
                <p className="text-xs text-muted-foreground">Organization</p>
                <p className="text-sm font-medium text-foreground truncate">{orgName}</p>
              </motion.div>
            )}

            {/* Looking to Help Toggle - smooth transition */}
            <button
              onClick={() => handleLookingToHelpToggle(!isLookingToHelp)}
              className={cn(
                "w-full flex items-center rounded-xl border transition-all duration-300",
                isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                isLookingToHelp
                  ? "bg-success/10 border-success/30"
                  : "bg-card border-border hover:bg-muted/50"
              )}
              title={isCollapsed ? (isLookingToHelp ? "Looking to help" : "Not looking to help") : undefined}
            >
              <HandHelping className={cn("w-5 h-5 shrink-0 transition-colors", isLookingToHelp ? "text-success" : "text-muted-foreground")} />

              <motion.div
                initial={false}
                animate={{
                  width: isCollapsed ? 0 : "auto",
                  opacity: isCollapsed ? 0 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn("overflow-hidden flex items-center justify-between", !isCollapsed && "flex-1")}
                style={{ pointerEvents: isCollapsed ? "none" : "auto" }}
              >
                <p className={cn("text-sm font-medium whitespace-nowrap", isLookingToHelp ? "text-success" : "text-foreground")}>
                  {isLookingToHelp ? "Helping" : "Not helping"}
                </p>
                <Switch
                  checked={isLookingToHelp}
                  onCheckedChange={handleLookingToHelpToggle}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-success ml-2"
                />
              </motion.div>
            </button>
          </div>
        )}

        {/* User Profile */}
        <div className={cn("p-3", isCollapsed && "px-2")}>
          <div className={cn(
            "flex items-center p-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer",
            isCollapsed && "justify-center"
          )}>
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {profile?.first_name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <>
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : "User"}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors active:scale-95 ml-auto shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
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
              <HamburgerLg className="w-6 h-6 text-foreground" />
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
            {children}
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
        <ChevronLeft className={cn(
          "w-4 h-4 transition-transform duration-300",
          isCollapsed && "rotate-180"
        )} />
      </button>

      {/* Onboarding Tour for New Users */}
      <OnboardingTour />

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsHelp />
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

