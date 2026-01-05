"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddPlusCircle, Exit, UsersGroup, SearchMagnifyingGlass, Clock, Building01 } from "react-coolicons";
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
          <h1 className="text-2xl font-bold text-foreground">My Pods</h1>
          <p className="text-muted-foreground mt-1">Collaborate with your team in focused pods</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/classes/join">
              <Exit className="mr-2 h-4 w-4" />
              Join Pod
            </Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/classes/create">
              <AddPlusCircle className="mr-2 h-4 w-4 text-white" />
              Create Pod
            </Link>
          </Button>
        </div>
      </div>

      {pods.length > 0 && (
        <div className="relative">
          <SearchMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pods by name or business unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredPods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPods.map((pod, index) => (
            <motion.div
              key={pod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/classes/${pod.pod_code}`}>
                <Card className="hover-lift cursor-pointer group h-full border border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="group-hover:text-primary transition-colors text-base truncate">
                          {pod.pod_name}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                          <Building01 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{pod.business_unit || "General"}</span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs shrink-0">
                        {pod.pod_code}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <UsersGroup className="w-3.5 h-3.5" />
                        <span>{pod.memberCount} {pod.memberCount === 1 ? 'member' : 'members'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(pod.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {pod.initiative_owner && (
                      <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground truncate">
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
          icon={UsersGroup}
          title="No pods yet"
          description="Pods are where the magic happens. Create your own or join a team pod to start collaborating with teammates."
          action={{ label: "Create Pod", href: "/classes/create" }}
          secondaryAction={{ label: "Join Pod", href: "/classes/join" }}
          variant="card"
        />
      ) : (
        <EmptyState
          icon={SearchMagnifyingGlass}
          title="No pods match your search"
          description="Try adjusting your search terms to find what you're looking for."
          variant="card"
        />
      )}
    </motion.div>
  );
}

