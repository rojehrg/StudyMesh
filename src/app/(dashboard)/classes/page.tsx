"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, LogIn, Users, Loader2, Search, Clock, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/empty-state";
import { PageLoader } from "@/components/loading-states";

export default function ClassesPage() {
  const [loading, setLoading] = useState(true);
  const [pods, setPods] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    loadPods();
  }, []);

  const loadPods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all pods where user is a member, with member counts in one query
      // Using a subquery approach to avoid N+1
      const { data: podMembers } = await supabase
        .from('pod_members')
        .select('pod_id')
        .eq('user_id', user.id);

      if (!podMembers || podMembers.length === 0) {
        setPods([]);
        return;
      }

      const podIds = podMembers.map(pm => pm.pod_id);

      // Single query to get pods with member counts using join
      const { data: podsData } = await supabase
        .from('pods')
        .select(`
          *,
          pod_members(count)
        `)
        .in('id', podIds)
        .order('created_at', { ascending: false });

      // Transform the data to include memberCount
      const podsWithCounts = (podsData || []).map(pod => ({
        ...pod,
        memberCount: pod.pod_members?.[0]?.count || 0,
      }));

      setPods(podsWithCounts);
    } catch (error) {
      console.error("Error loading pods:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPods = pods.filter(pod =>
    pod.pod_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pod.business_unit?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <PageLoader message="Loading your pods..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Enablement Pods</h1>
          <p className="text-muted-foreground mt-1">Collaborate with your team in focused pods</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/classes/join">
              <LogIn className="mr-2 h-4 w-4" />
              Join Pod
            </Link>
          </Button>
          <Button className="bg-accent hover:bg-accent/80 text-accent-foreground" asChild>
            <Link href="/classes/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Pod
            </Link>
          </Button>
        </div>
      </div>

      {pods.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pods by name or business unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredPods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPods.map((pod, index) => (
            <motion.div
              key={pod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/classes/${pod.pod_code}`}>
                <Card className="hover-lift cursor-pointer group h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="group-hover:text-accent transition-colors">
                          {pod.pod_name}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {pod.business_unit || "General"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary shadow-sm">
                        {pod.pod_code}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{pod.memberCount} {pod.memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {new Date(pod.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {pod.initiative_owner && (
                      <div className="mt-3 pt-3 text-xs text-muted-foreground">
                        Owner: {pod.initiative_owner}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : pods.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No pods yet"
          description="Pods are where the magic happens. Create your own or join a team pod to start collaborating with teammates."
          action={{ label: "Create Pod", href: "/classes/create" }}
          secondaryAction={{ label: "Join Pod", href: "/classes/join" }}
          variant="card"
        />
      ) : (
        <EmptyState
          icon={Search}
          title="No pods match your search"
          description="Try adjusting your search terms to find what you're looking for."
          variant="card"
        />
      )}
    </motion.div>
  );
}

