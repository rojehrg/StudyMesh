import Link from "next/link";
import { PlusCircle, LogIn, Users, Sparkles, Clock, Bell, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

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

  // Get notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('read')
    .eq('recipient_id', user.id);

  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;
  const knowledgeAreas = profile.knowledge_areas || profile.expertise_skills || [];

  // Get currently available teammates from user's pods
  let availableTeammates: any[] = [];
  if (podIds.length > 0) {
    // Get all members of user's pods
    const { data: podMembers } = await supabase
      .from('pod_members')
      .select('user_id')
      .in('pod_id', podIds)
      .neq('user_id', user.id);

    const teammateIds = [...new Set(podMembers?.map(pm => pm.user_id) || [])];

    if (teammateIds.length > 0) {
      const { data: availableProfiles } = await supabase
        .from('profiles')
        .select('user_id, major, department, currently_available, looking_to_help, knowledge_areas, expertise_skills, timezone')
        .in('user_id', teammateIds)
        .eq('currently_available', true)
        .limit(6);

      availableTeammates = availableProfiles || [];
    }
  }

  // Get people looking to help in user's pods
  let helpersCount = 0;
  if (podIds.length > 0) {
    const { data: podMembers } = await supabase
      .from('pod_members')
      .select('user_id')
      .in('pod_id', podIds)
      .neq('user_id', user.id);

    const teammateIds = [...new Set(podMembers?.map(pm => pm.user_id) || [])];

    if (teammateIds.length > 0) {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('user_id', teammateIds)
        .eq('looking_to_help', true);
      helpersCount = count || 0;
    }
  }

  // Profile completion - simplified
  const completionSteps = [
    { done: !!profile.department, label: "Add department" },
    { done: !!profile.major, label: "Add job title" },
    { done: knowledgeAreas.length > 0, label: "Add knowledge areas" },
    { done: !!profile.timezone, label: "Set timezone" },
    { done: podIds.length > 0, label: "Join a pod" },
  ];
  const completedSteps = completionSteps.filter(s => s.done).length;
  const completionPercent = Math.round((completedSteps / completionSteps.length) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{profile.first_name ? `, ${profile.first_name}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">See who's available to help</p>
        </div>
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-lift">
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

        <Card className="hover-lift">
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

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Looking to Help</CardTitle>
            <Sparkles className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{helpersCount}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {helpersCount === 0 ? "Be the first" : "Open to helping"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
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
      </div>

      {/* Available Teammates */}
      {availableTeammates.length > 0 && (
        <Card>
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

      {/* Profile Completion */}
      {completionPercent < 100 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Complete Your Profile
                </CardTitle>
                <CardDescription>Help teammates find you</CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                {completionPercent}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {completionSteps.filter(s => !s.done).slice(0, 4).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    {step.label}
                  </div>
                ))}
              </div>
              <Button variant="outline" asChild className="w-full hover:bg-primary/10 hover:border-primary/50">
                <Link href="/settings">
                  Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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

      {/* Quick Actions */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/classes">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-primary/10 transition-all cursor-pointer text-center group">
                <Users className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Browse Pods</p>
              </div>
            </Link>
            <Link href="/settings">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-accent/10 transition-all cursor-pointer text-center group">
                <Clock className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Set Availability</p>
              </div>
            </Link>
            <Link href="/classes/join">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-primary/10 transition-all cursor-pointer text-center group">
                <LogIn className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Join Pod</p>
              </div>
            </Link>
            <Link href="/notifications">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-accent/10 transition-all cursor-pointer text-center group">
                <Bell className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Notifications</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
