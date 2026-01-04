"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading, ChevronLeft, UsersGroup, Building01, User01 } from "react-coolicons";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function JoinPodPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [podCode, setPodCode] = useState("");
  const [podPreview, setPodPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const checkPodCode = async () => {
    if (!podCode.trim()) return;
    
    setChecking(true);
    setError(null);
    setPodPreview(null);

    try {
      const { data: pod, error } = await supabase
        .from('pods')
        .select('*')
        .eq('pod_code', podCode.toUpperCase().trim())
        .single();

      if (error || !pod) {
        setError("Pod not found. Please check the code and try again.");
        return;
      }

      // Get member count
      const { count } = await supabase
        .from('pod_members')
        .select('*', { count: 'exact', head: true })
        .eq('pod_id', pod.id);

      // Check if user is already a member
      const { data: { user } } = await supabase.auth.getUser();
      const { data: existingMember } = await supabase
        .from('pod_members')
        .select('id')
        .eq('pod_id', pod.id)
        .eq('user_id', user?.id)
        .single();

      setPodPreview({
        ...pod,
        memberCount: count || 0,
        alreadyMember: !!existingMember
      });
    } catch (error) {
      console.error("Error checking pod:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const notifyMatchingMembers = async (podId: string, newUserId: string, newUserName: string) => {
    try {
      // Get new user's profile
      const { data: newUserProfile } = await supabase
        .from('profiles')
        .select('expertise_skills, growth_skills')
        .eq('user_id', newUserId)
        .single();

      if (!newUserProfile) return;

      // Get existing pod members (excluding new user)
      const { data: podMembers } = await supabase
        .from('pod_members')
        .select('user_id')
        .eq('pod_id', podId)
        .neq('user_id', newUserId);

      if (!podMembers || podMembers.length === 0) return;

      // Get their profiles
      const { data: memberProfiles } = await supabase
        .from('profiles')
        .select('user_id, expertise_skills, growth_skills')
        .in('user_id', podMembers.map(m => m.user_id));

      if (!memberProfiles) return;

      // Simple matching: notify members if new user has skills they want to learn
      const notifications = [];
      const newUserExpertise = (newUserProfile.expertise_skills || []).map((s: string) => s.toLowerCase());

      for (const memberProfile of memberProfiles) {
        const memberGrowth = (memberProfile.growth_skills || []).map((s: string) => s.toLowerCase());

        // Find skills the new user has that this member wants to learn
        const matchingSkills = newUserExpertise.filter((skill: string) =>
          memberGrowth.some((g: string) => g === skill)
        );

        if (matchingSkills.length > 0) {
          const skillNames = (newUserProfile.expertise_skills || [])
            .filter((s: string) => matchingSkills.includes(s.toLowerCase()))
            .slice(0, 2);

          notifications.push({
            recipient_id: memberProfile.user_id,
            sender_id: newUserId,
            type: 'new_match',
            content: `${newUserName} joined your pod and knows ${skillNames.join(', ')}!`,
            metadata: {
              skills: skillNames,
              pod_id: podId,
            },
            read: false,
          });
        }
      }

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications);
      }
    } catch (error) {
      console.error("Error notifying matching members:", error);
      // Don't throw - this is a non-critical operation
    }
  };

  const handleJoin = async () => {
    if (!podPreview) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get current user's name for notification
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('major')
        .eq('user_id', user.id)
        .single();

      const userName = currentProfile?.major || "A new member";

      // Add user as member
      const { error } = await supabase
        .from('pod_members')
        .insert({
          pod_id: podPreview.id,
          user_id: user.id,
        });

      if (error) throw error;

      // Notify matching members asynchronously
      notifyMatchingMembers(podPreview.id, user.id, userName);

      toast.success("Joined pod successfully!", {
        description: podPreview.pod_name
      });
      router.push(`/classes/${podPreview.pod_code}`);
    } catch (error: any) {
      console.error("Error joining pod:", error);
      toast.error("Failed to join pod", {
        description: error.message || "Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/classes">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Pods
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Join Enablement Pod</CardTitle>
          <CardDescription>
            Enter a pod code to join an existing enablement pod
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="podCode">Pod Code</Label>
              <div className="flex gap-2">
                <Input
                  id="podCode"
                  placeholder="e.g. ABC123"
                  value={podCode}
                  onChange={(e) => {
                    setPodCode(e.target.value.toUpperCase());
                    setPodPreview(null);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && checkPodCode()}
                  disabled={checking || loading}
                  className="font-mono text-lg"
                  maxLength={6}
                />
                <Button 
                  onClick={checkPodCode}
                  disabled={checking || !podCode.trim() || loading}
                  variant="outline"
                >
                  {checking ? <Loading className="h-4 w-4 animate-spin" /> : "Check"}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            {podPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-2 border-accent/30 rounded-xl p-6 bg-accent/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {podPreview.pod_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building01 className="w-4 h-4" />
                      {podPreview.business_unit || "General"}
                    </div>
                  </div>
                  <div className="bg-card px-3 py-1 rounded-lg border border-accent/40 font-mono text-sm font-medium text-accent">
                    {podPreview.pod_code}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {podPreview.initiative_owner && (
                    <div className="flex items-center gap-2 text-foreground">
                      <User01 className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Owner:</span> {podPreview.initiative_owner}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground">
                    <UsersGroup className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Members:</span> {podPreview.memberCount}
                  </div>
                </div>

                {podPreview.alreadyMember ? (
                  <div className="mt-6 space-y-3">
                    <div className="bg-card border border-accent/30 rounded-lg p-3">
                      <p className="text-sm text-accent font-medium">
                        ✅ You're already a member of this pod
                      </p>
                    </div>
                    <Button
                      asChild
                      className="w-full bg-accent hover:bg-accent/80"
                    >
                      <Link href={`/classes/${podPreview.pod_code}`}>
                        View Pod
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full mt-6 bg-accent hover:bg-accent/80"
                  >
                    {loading ? <Loading className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Join This Pod
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <p className="text-sm text-foreground font-medium mb-2">
              💡 Don't have a code?
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Ask your team lead or initiative owner for the pod code, or create your own pod to get started.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/classes/create">Create New Pod</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

