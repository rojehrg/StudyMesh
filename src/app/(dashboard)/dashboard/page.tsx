import Link from "next/link";
import { PlusCircle, LogIn, Users, Sparkles, TrendingUp, Bell, ArrowRight, Target, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Welcome back{profile.major ? `, ${profile.major.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Here's what's happening with your enablement</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/classes/join">
              <LogIn className="mr-2 h-4 w-4" />
              Join Pod
            </Link>
          </Button>
          <Button className="bg-teal-600 hover:bg-teal-700" asChild>
            <Link href="/classes/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Pod
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pods</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{podIds.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {podIds.length === 0 ? "Join your first pod" : "Enablement groups"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Matches Found</CardTitle>
            <Sparkles className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{matchCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
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
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{expertiseCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expertiseCount === 0 ? "Add your expertise" : "Can mentor others"}
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Notifications</CardTitle>
            <Bell className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadNotifications === 0 ? "All caught up" : "Unread nudges"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      {(trendingSkills.length > 0 || (activeHelpersCount ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trending Skills */}
          {trendingSkills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-600" />
                  Most Requested Skills
                </CardTitle>
                <CardDescription className="text-xs">
                  Skills teammates are looking for help with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trendingSkills.map(({ skill, count }) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground capitalize">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full"
                            style={{ width: `${Math.min(100, (count / trendingSkills[0].count) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {profile.expertise_skills?.some((s: string) =>
                  trendingSkills.some(t => s.toLowerCase().includes(t.skill) || t.skill.includes(s.toLowerCase()))
                ) && (
                  <p className="text-xs text-teal-600 mt-3 font-medium">
                    You have skills people need!
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Community Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                Community Insights
              </CardTitle>
              <CardDescription className="text-xs">
                What's happening in Meshflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{activeHelpersCount || 0}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Active Helpers</p>
                </div>
                <div className="p-3 bg-teal-500/10 dark:bg-teal-500/20 rounded-lg text-center">
                  <p className="text-2xl font-bold text-teal-700 dark:text-teal-400">{openRequests?.length || 0}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400">Open Requests</p>
                </div>
              </div>
              {!profile.looking_to_help && (activeHelpersCount ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Toggle "Looking to Help" in sidebar to join active helpers
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Completion */}
      {completionPercent < 100 && (
        <Card className="border-2 border-teal-200 dark:border-teal-800 bg-teal-50/30 dark:bg-teal-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  Complete Your Profile
                </CardTitle>
                <CardDescription>Get the most out of Meshflow</CardDescription>
              </div>
              <Badge className="bg-teal-600 text-white text-lg px-3 py-1">
                {completionPercent}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {completionSteps.filter(s => !s.done).slice(0, 4).map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    {step.label}
                  </div>
                ))}
              </div>
              <Button variant="outline" asChild className="w-full mt-2 hover:bg-teal-50 hover:border-teal-300">
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
          <h2 className="text-xl font-bold text-foreground">Your Pods</h2>
          {pods.length > 0 && (
            <Link href="/classes" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
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
                      <CardTitle className="group-hover:text-teal-600 transition-colors line-clamp-1">
                        {pod.pod_name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-200 shrink-0 ml-2">
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
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-teal-600 dark:text-teal-400" />
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
                <Button className="bg-teal-600 hover:bg-teal-700" asChild>
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
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/groups">
              <div className="p-4 bg-card rounded-xl border hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all cursor-pointer text-center">
                <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Find Matches</p>
              </div>
            </Link>
            <Link href="/settings?tab=skills">
              <div className="p-4 bg-card rounded-xl border hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all cursor-pointer text-center">
                <TrendingUp className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Add Skills</p>
              </div>
            </Link>
            <Link href="/notifications">
              <div className="p-4 bg-card rounded-xl border hover:border-cyan-300 dark:hover:border-cyan-700 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/20 transition-all cursor-pointer text-center">
                <Bell className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Notifications</p>
              </div>
            </Link>
            <Link href="/about">
              <div className="p-4 bg-card rounded-xl border hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50/30 dark:hover:bg-teal-900/20 transition-all cursor-pointer text-center">
                <Users className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Learn More</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
