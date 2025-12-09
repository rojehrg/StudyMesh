"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  PlusCircle,
  LogIn,
  Settings,
  Info,
  ChevronLeft,
  Menu,
  LogOut,
  Sparkles
} from "lucide-react";
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
        <Icon className="w-5 h-5 shrink-0" />
        {badge ? (
          <span className={cn(
            "absolute -top-1 -right-1 bg-ctp-peach text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full z-10",
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
        <span className="ml-auto bg-ctp-peach/20 text-ctp-peach text-xs font-bold px-2 py-0.5 rounded-full">
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
  const [lookingToHelp, setLookingToHelp] = useState(false);
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

      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, looking_to_help')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setLookingToHelp(data.looking_to_help || false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const toggleLookingToHelp = async (checked: boolean) => {
    setLookingToHelp(checked);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ looking_to_help: checked, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success(checked ? "You're now looking to help!" : "Help status turned off", {
        description: checked ? "Teammates can see you're available" : "You won't appear as available to help"
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setLookingToHelp(!checked); // Revert on error
      toast.error("Failed to update status");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Force a hard navigation to clear any cached state
    window.location.href = "/login";
  };

  const navItems: Array<{ icon: any; label: string; href: string; badge?: number }> = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Pods", href: "/classes" },
    { icon: PlusCircle, label: "Create Pod", href: "/classes/create" },
    { icon: LogIn, label: "Join Pod", href: "/classes/join" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Info, label: "About Meshflow", href: "/about" },
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
          <Link href="/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
            <span className={cn(
              "text-primary text-xl font-bold shrink-0 transition-all duration-300",
              isCollapsed ? "w-12 text-center" : ""
            )}>
              M
            </span>
            <motion.span
              initial={false}
              animate={{ width: isCollapsed ? 0 : "auto", opacity: isCollapsed ? 0 : 1 }}
              className="whitespace-nowrap overflow-hidden"
            >
              <span className="text-primary text-xl font-bold">esh</span>
              <span className="text-foreground text-xl font-bold">flow</span>
            </motion.span>
          </Link>
        </div>

        {/* Looking to Help Toggle */}
        <div className={cn(
          "mx-3 mt-3 p-3 rounded-xl transition-all duration-300",
          lookingToHelp
            ? "bg-primary/10 shadow-md"
            : "bg-muted/50 shadow-sm"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              lookingToHelp ? "bg-primary" : "bg-muted-foreground/30"
            )}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <motion.div
                initial={false}
                animate={{ opacity: isCollapsed ? 0 : 1 }}
                className="flex-1 min-w-0"
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm font-medium",
                    lookingToHelp ? "text-primary" : "text-muted-foreground"
                  )}>
                    Looking to Help
                  </span>
                  <Switch
                    checked={lookingToHelp}
                    onCheckedChange={toggleLookingToHelp}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lookingToHelp ? "Visible to teammates" : "Toggle to help others"}
                </p>
              </motion.div>
            )}
            {isCollapsed && (
              <Switch
                checked={lookingToHelp}
                onCheckedChange={toggleLookingToHelp}
                className="data-[state=checked]:bg-primary hidden"
              />
            )}
          </div>
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
              {lookingToHelp && (
                <p className="text-xs text-primary truncate flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Available to help
                </p>
              )}
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
        {/* Header - Fixed positioning */}
        <header className={cn(
          "h-14 bg-card/95 backdrop-blur-sm shadow-sm flex items-center justify-between px-4 fixed top-0 right-0 z-30 border-b border-border/50",
          isCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
        )}>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)} className="md:hidden">
              <Menu className="w-6 h-6 text-foreground" />
            </Button>
            <span className="ml-3 font-bold text-lg md:hidden text-foreground">Meshflow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NudgesDropdown />
          </div>
        </header>

        {/* Page Content - Add top margin for fixed header */}
        <main className="flex-1 px-6 md:px-8 pb-6 md:pb-8 overflow-x-hidden mt-14 pt-6">
          {children}
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
    </div>
  );
}

