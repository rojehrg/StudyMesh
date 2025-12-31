import Link from "next/link";
import { PlusCircle, LogIn, Users, Sparkles, Clock, Bell, ArrowRight, Zap, MessageCircle, HandHelping, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingChecklist } from "@/components/onboarding-checklist";
import { AvailableDot } from "@/components/available-now-indicator";
import { LookingToHelpToggle } from "@/components/looking-to-help-toggle";

// Helper to format relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile - use maybeSingle to handle case where profile doesn't exist
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  if (!profile) {
    redirect('/onboarding');
  }

  // Get user's pods
  const { data: userPods } = await supabase
    .from('pod_members')
    .select('pod_id')
    .eq('user_id', user.id);

  const podIds = userPods?.map(pm => pm.pod_id) || [];

  let pods: any[] = [];
  if (podIds.length > 0) {
    const { data: podsData } = await supabase
      .from('pods')
      .select('*')
      .in('id', podIds)
      .order('created_at', { ascending: false })
      .limit(3);
    pods = podsData || [];
  }

  // Get notifications (unread count)
  const { data: notifications } = await supabase
    .from('notifications')
    .select('read')
    .eq('recipient_id', user.id);

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;

  // Get recent nudges for the user (both sent and received)
  const { data: recentNudges } = await supabase
    .from('notifications')
    .select('id, type, content, metadata, read, created_at, sender_id, recipient_id')
    .or(`recipient_id.eq.${user.id},sender_id.eq.${user.id}`)
    .eq('type', 'nudge')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get sender/recipient profiles for nudges
  const nudgeUserIds = [...new Set([
    ...(recentNudges?.map(n => n.sender_id) || []),
    ...(recentNudges?.map(n => n.recipient_id) || [])
  ].filter(Boolean))] as string[];

  let nudgeProfiles: Record<string, any> = {};
  if (nudgeUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, major')
      .in('user_id', nudgeUserIds);
    nudgeProfiles = (profiles || []).reduce((acc, p) => {
      acc[p.user_id] = p;
      return acc;
    }, {} as Record<string, any>);
  }
  const knowledgeAreas = profile.knowledge_areas || profile.expertise_skills || [];

  // Get currently available teammates from user's pods
  let availableTeammates: any[] = [];
  let helpersCount = 0;
  let hasTeammates = false;
  if (podIds.length > 0) {
    // Get all members of user's pods
    const { data: podMembers } = await supabase
      .from('pod_members')
      .select('user_id')
      .in('pod_id', podIds)
      .neq('user_id', user.id);

    const teammateIds = [...new Set(podMembers?.map(pm => pm.user_id) || [])];
    hasTeammates = teammateIds.length > 0;

    if (teammateIds.length > 0) {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('user_id, major, department, availability, knowledge_areas, expertise_skills, timezone')
        .in('user_id', teammateIds);

      // Filter for currently available (from availability JSON)
      availableTeammates = (allProfiles || [])
        .filter(p => p.availability?.currentlyAvailable === true)
        .slice(0, 6);

      // Count people looking to help (from availability JSON)
      helpersCount = (allProfiles || [])
        .filter(p => p.availability?.lookingToHelp === true)
        .length;
    }
  }

  // Check if user has sent their first nudge
  const { data: sentNudges } = await supabase
    .from('notifications')
    .select('id')
    .eq('sender_id', user.id)
    .eq('type', 'nudge')
    .limit(1);
  const hasSentFirstNudge = (sentNudges?.length || 0) > 0;

  // Gamified onboarding checklist items
  const onboardingItems = [
    {
      id: "skills",
      label: "Add your skills",
      description: "Tell us what you're great at so teammates can find you.",
      done: knowledgeAreas.length > 0,
      href: "/settings",
      action: "Add skills",
    },
    {
      id: "availability",
      label: "Set your availability",
      description: "Let others know when you're free to help.",
      done: !!profile.availability?.slots?.length,
      href: "/settings",
      action: "Set times",
    },
    {
      id: "pod",
      label: "Join or create a pod",
      description: "Connect with your team to start collaborating.",
      done: podIds.length > 0,
      href: "/classes",
      action: "Get started",
    },
    {
      id: "nudge",
      label: "Send your first nudge",
      description: hasTeammates
        ? "Reach out to a teammate for help or offer your expertise."
        : "Invite teammates to your pod first, then you can nudge them.",
      done: hasSentFirstNudge || (podIds.length > 0 && !hasTeammates),
      href: pods.length > 0 ? `/classes/${pods[0]?.pod_code}` : "/classes",
      action: hasTeammates ? "Nudge" : "Invite",
    },
    {
      id: "profile",
      label: "Complete your profile",
      description: "Add your title and department to help teammates know you.",
      done: !!profile.department && !!profile.major,
      href: "/settings",
      action: "Complete",
    },
  ];

  const completedSteps = onboardingItems.filter(s => s.done).length;
  const completionPercent = Math.round(((completedSteps + 1) / (onboardingItems.length + 1)) * 100); // +1 for "Account created"

  // Get current lookingToHelp status
  const isLookingToHelp = profile.availability?.lookingToHelp || false;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{profile.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">See who's available to help</p>
        </div>
        <div className="flex items-center gap-3">
          <LookingToHelpToggle initialValue={isLookingToHelp} userId={user.id} />
          <div className="hidden sm:flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/classes/join">
                <LogIn className="mr-2 h-4 w-4" />
                Join Pod
              </Link>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/classes/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Pod
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile buttons */}
      <div className="flex sm:hidden gap-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/classes/join">
            <LogIn className="mr-2 h-4 w-4" />
            Join Pod
          </Link>
        </Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link href="/classes/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Pod
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/classes">
          <Card className="hover-lift cursor-pointer h-full transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Your Pods</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{podIds.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {podIds.length === 0 ? "Join your first pod" : "Active teams"}
              </p>
            </CardContent>
          </Card>
        </Link>

        <a href="#available-teammates">
          <Card className="hover-lift cursor-pointer h-full transition-colors hover:border-success/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Now</CardTitle>
              <Zap className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{availableTeammates.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {availableTeammates.length === 0 ? "No one right now" : "Teammates online"}
              </p>
            </CardContent>
          </Card>
        </a>

        <Link href="/classes">
          <Card className="hover-lift cursor-pointer h-full transition-colors hover:border-accent/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Looking to Help</CardTitle>
              <Sparkles className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{helpersCount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {helpersCount === 0 ? "No helpers yet" : `${helpersCount === 1 ? "Teammate" : "Teammates"} ready to help`}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/notifications">
          <Card className="hover-lift cursor-pointer h-full transition-colors hover:border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
              <Bell className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{unreadNotifications}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadNotifications === 0 ? "All caught up" : "Unread nudges"}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Available Teammates */}
      {availableTeammates.length > 0 && (
        <Card id="available-teammates">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-success" />
                  Available Now
                </CardTitle>
                <CardDescription>Teammates ready for a quick chat</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableTeammates.map((teammate) => {
                const areas = teammate.knowledge_areas || teammate.expertise_skills || [];
                return (
                  <div
                    key={teammate.user_id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-success/5 border border-success/20"
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-success/20 text-success font-semibold">
                        {(teammate.major || 'T')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground truncate">{teammate.major || "Teammate"}</h4>
                        <Badge className="bg-success/20 text-success text-xs px-1.5 border-0 shrink-0">
                          <Clock className="w-3 h-3 mr-1" />
                          Now
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{teammate.department || "Team member"}</p>
                      {areas.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {areas.slice(0, 2).map((area: string) => (
                            <span key={area} className="text-xs bg-muted px-2 py-0.5 rounded">
                              {area}
                            </span>
                          ))}
                          {areas.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{areas.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Nudges */}
      {recentNudges && recentNudges.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest nudges and connections</CardDescription>
              </div>
              <Link href="/notifications" className="text-sm text-primary hover:underline font-medium">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNudges.map((nudge) => {
                const isSent = nudge.sender_id === user.id;
                const otherUserId = isSent ? nudge.recipient_id : nudge.sender_id;
                const otherProfile = nudgeProfiles[otherUserId];
                const otherName = otherProfile?.major || otherProfile?.first_name || "Teammate";
                const nudgeType = (nudge.metadata as any)?.nudge_type;
                const topic = (nudge.metadata as any)?.topic;
                const timeAgo = getTimeAgo(new Date(nudge.created_at));

                return (
                  <div
                    key={nudge.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      !nudge.read && !isSent ? "bg-primary/5 border-primary/20" : "bg-card border-border"
                    }`}
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={`font-semibold text-sm ${
                        nudgeType === 'ask' ? "bg-info/20 text-info" : "bg-success/20 text-success"
                      }`}>
                        {otherName[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground text-sm">
                          {isSent ? `You → ${otherName}` : `${otherName} → You`}
                        </span>
                        <Badge className={`text-xs px-1.5 border-0 ${
                          nudgeType === 'ask'
                            ? "bg-info/20 text-info"
                            : "bg-success/20 text-success"
                        }`}>
                          {nudgeType === 'ask' ? (
                            <><HelpCircle className="w-3 h-3 mr-0.5" /> Asked</>
                          ) : (
                            <><HandHelping className="w-3 h-3 mr-0.5" /> Offered</>
                          )}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                      </div>
                      {topic && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {topic}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Checklist */}
      {completionPercent < 100 && (
        <OnboardingChecklist items={onboardingItems} />
      )}

      {/* Your Pods */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Pods</h2>
          {pods.length > 0 && (
            <Link href="/classes" className="text-sm text-primary hover:underline font-medium">
              View all →
            </Link>
          )}
        </div>

        {pods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pods.map((pod) => (
              <Link key={pod.id} href={`/classes/${pod.pod_code}`}>
                <Card className="hover-lift cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-1">
                        {pod.pod_name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary shrink-0 ml-2">
                        {pod.pod_code}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-1">
                      {pod.business_unit || "General"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        View members
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Join your first pod</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Pods are small groups of teammates who help each other. Create one or ask for a code to join.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/classes/join">
                    <LogIn className="mr-2 h-4 w-4" />
                    Join Pod
                  </Link>
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link href="/classes/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Pod
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}
