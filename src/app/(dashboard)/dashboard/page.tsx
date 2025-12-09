import Link from "next/link";
import { PlusCircle, LogIn, Users, Sparkles, TrendingUp, Bell, ArrowRight, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HelpRequests } from "@/components/help-requests";

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

  // Get stats
  const { data: allMatches } = await supabase
    .from('compatibility_scores')
    .select('score')
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .gt('score', 0);

  const { data: notifications } = await supabase
    .from('notifications')
    .select('read')
    .eq('recipient_id', user.id);

  const matchCount = allMatches?.length || 0;
  const unreadNotifications = notifications?.filter(n => !n.read).length || 0;
  const expertiseCount = profile.expertise_skills?.length || 0;
  const growthCount = profile.growth_skills?.length || 0;

  // Fetch analytics: most requested skills from open_requests
  const { data: openRequests } = await supabase
    .from('open_requests')
    .select('skill')
    .eq('status', 'open')
    .limit(50);

  // Count skill occurrences
  const skillCounts: Record<string, number> = {};
  openRequests?.forEach(r => {
    if (r.skill) {
      const skill = r.skill.toLowerCase();
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  });
  const trendingSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({ skill, count }));

  // Get active helpers count (people with looking_to_help = true)
  const { count: activeHelpersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('looking_to_help', true);

  // Profile completion
  const completionSteps = [
    { done: !!profile.department, label: "Add department" },
    { done: !!profile.major, label: "Add job title" },
    { done: expertiseCount > 0, label: "Add expertise skills" },
    { done: growthCount > 0, label: "Add growth goals" },
    { done: !!profile.bio, label: "Write bio" },
    { done: podIds.length > 0, label: "Join a pod" },
  ];
  const completedSteps = completionSteps.filter(s => s.done).length;
  const completionPercent = Math.round((completedSteps / completionSteps.length) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back{profile.major ? `, ${profile.major.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your enablement</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pods</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{podIds.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {podIds.length === 0 ? "Join your first pod" : "Enablement groups"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matches Found</CardTitle>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{matchCount}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {matchCount === 0 ? "Add skills to find matches" : "Knowledge partners"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skills Shared</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{expertiseCount}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {expertiseCount === 0 ? "Add your expertise" : "Can mentor others"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
            <Bell className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{unreadNotifications}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {unreadNotifications === 0 ? "All caught up" : "Unread nudges"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help Requests */}
      <HelpRequests />

      {/* Analytics Section */}
      {(trendingSkills.length > 0 || (activeHelpersCount ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trending Skills */}
          {trendingSkills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Most Requested Skills
                </CardTitle>
                <CardDescription>
                  Skills teammates are looking for help with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingSkills.map(({ skill, count }) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground capitalize">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-accent h-full rounded-full"
                            style={{ width: `${Math.min(100, (count / trendingSkills[0].count) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {profile.expertise_skills?.some((s: string) =>
                  trendingSkills.some(t => s.toLowerCase().includes(t.skill) || t.skill.includes(s.toLowerCase()))
                ) && (
                  <p className="text-sm text-accent mt-4 font-medium">
                    You have skills people need!
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Community Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Community Insights
              </CardTitle>
              <CardDescription>
                What's happening in Meshflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">{activeHelpersCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Helpers</p>
                </div>
                <div className="p-4 bg-primary/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">{openRequests?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Open Requests</p>
                </div>
              </div>
              {!profile.looking_to_help && (activeHelpersCount ?? 0) > 0 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Toggle "Looking to Help" in sidebar to join active helpers
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Completion */}
      {completionPercent < 100 && (
        <Card className="bg-accent/10 shadow-lg border-accent/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Complete Your Profile
                </CardTitle>
                <CardDescription>Get the most out of Meshflow</CardDescription>
              </div>
              <Badge className="bg-accent text-white text-lg px-3 py-1">
                {completionPercent}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-500"
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
              <Button variant="outline" asChild className="w-full hover:bg-accent/10 hover:border-accent/50">
                <Link href="/settings">
                  Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Pods or Empty State */}
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
                      <CardTitle className="group-hover:text-accent transition-colors line-clamp-1">
                        {pod.pod_name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-accent/10 text-accent shadow-sm shrink-0 ml-2">
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
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-accent dark:text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ready to start enabling?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first pod or join an existing one to connect with teammates and fill knowledge gaps.
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
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-accent/15 transition-all cursor-pointer text-center group">
                <Users className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Browse Pods</p>
              </div>
            </Link>
            <Link href="/settings">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-primary/15 transition-all cursor-pointer text-center group">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Add Skills</p>
              </div>
            </Link>
            <Link href="/classes/join">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-accent/15 transition-all cursor-pointer text-center group">
                <LogIn className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Join Pod</p>
              </div>
            </Link>
            <Link href="/classes/create">
              <div className="p-4 bg-card rounded-xl shadow-sm hover:shadow-md hover:bg-secondary/15 transition-all cursor-pointer text-center group">
                <PlusCircle className="w-6 h-6 text-secondary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">Create Pod</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
