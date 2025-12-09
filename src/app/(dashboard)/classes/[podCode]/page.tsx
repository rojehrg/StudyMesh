"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { NudgeDialog } from "@/components/nudge-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Users, Copy, Check, Bell, Sparkles, TrendingUp, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const podCode = params.podCode as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [pod, setPod] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserExpertise, setCurrentUserExpertise] = useState<string[]>([]);
  const [nudgeDialogOpen, setNudgeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);

  useEffect(() => {
    loadPodData();
  }, [podCode]);

  const loadPodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      // Get current user's profile for expertise skills
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('expertise_skills')
        .eq('user_id', user.id)
        .single();

      setCurrentUserExpertise(currentProfile?.expertise_skills || []);

      // Get pod details
      const { data: podData, error: podError } = await supabase
        .from('pods')
        .select('*')
        .eq('pod_code', podCode.toUpperCase())
        .single();

      if (podError || !podData) {
        toast.error("Pod not found");
        router.push('/classes');
        return;
      }

      setPod(podData);

      // Get pod members with profiles
      const { data: podMembers } = await supabase
        .from('pod_members')
        .select('user_id, joined_at')
        .eq('pod_id', podData.id);

      if (podMembers && podMembers.length > 0) {
        const userIds = podMembers.map(pm => pm.user_id);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', userIds);

        const membersWithProfiles = podMembers.map(pm => {
          const profile = profiles?.find(p => p.user_id === pm.user_id);
          return {
            userId: pm.user_id,
            joinedAt: pm.joined_at,
            name: profile?.major || "Team Member",
            department: profile?.department,
            expertiseSkills: profile?.expertise_skills || [],
            growthSkills: profile?.growth_skills || [],
            lookingToHelp: profile?.looking_to_help || false,
            slackHandle: profile?.slack_handle || "",
          };
        });

        setMembers(membersWithProfiles);
      }
    } catch (error) {
      console.error("Error loading pod:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyPodCode = () => {
    navigator.clipboard.writeText(pod.pod_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Pod code copied!", {
      description: `Share ${pod.pod_code} with teammates`
    });
  };

  const openNudgeDialog = (member: any) => {
    setSelectedMember(member);
    setNudgeDialogOpen(true);
  };

  const handleNudge = async (recipientId: string, topic: string, type: 'ask' | 'offer') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('major')
        .eq('user_id', user.id)
        .single();

      const senderName = senderProfile?.major || "A teammate";
      const content = type === 'ask'
        ? `${senderName} wants your help with ${topic}`
        : `${senderName} can help you with ${topic}`;

      const { error } = await supabase.from('notifications').insert({
        recipient_id: recipientId,
        sender_id: user.id,
        type: 'nudge',
        content,
        metadata: { topic, pod_id: pod.id, pod_code: pod.pod_code, nudge_type: type },
        read: false,
      });

      if (error) throw error;

      // Optional Slack webhook
      const slackHandle = selectedMember?.slackHandle;
      if (slackHandle) {
        fetch('/api/slack/nudge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientSlackHandle: slackHandle,
            senderName,
            topic,
            podCode: pod?.pod_code,
            nudgeType: type,
          }),
        }).catch(() => {});
      }

      toast.success("Nudge sent!", {
        description: type === 'ask' ? `Asked for help with ${topic}` : `Offered help with ${topic}`
      });
    } catch (error) {
      console.error("Error sending nudge:", error);
      toast.error("Failed to send nudge");
      throw error;
    }
  };

  // Calculate simple skill stats
  const getSkillStats = () => {
    const expertiseCount: Record<string, number> = {};
    const growthCount: Record<string, number> = {};

    members.forEach(m => {
      m.expertiseSkills.forEach((skill: string) => {
        expertiseCount[skill] = (expertiseCount[skill] || 0) + 1;
      });
      m.growthSkills.forEach((skill: string) => {
        growthCount[skill] = (growthCount[skill] || 0) + 1;
      });
    });

    const topExpertise = Object.entries(expertiseCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topGrowth = Object.entries(growthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { topExpertise, topGrowth };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pod) return null;

  const { topExpertise, topGrowth } = getSkillStats();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/classes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pods
            </Link>
          </Button>
        </div>

        {/* Pod Header */}
        <Card className="shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">{pod.pod_name}</CardTitle>
                <CardDescription className="text-base">
                  {pod.business_unit || "General"} • {members.length} {members.length === 1 ? 'member' : 'members'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 px-3 py-1.5 rounded-lg border-2 border-primary/30 font-mono text-base font-bold text-primary">
                  {pod.pod_code}
                </div>
                <Button
                  onClick={copyPodCode}
                  size="icon"
                  variant="outline"
                  className="hover:bg-primary/10 h-9 w-9"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Simple Skill Overview */}
        {members.length > 1 && (topExpertise.length > 0 || topGrowth.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topExpertise.length > 0 && (
              <Card className="bg-accent/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-accent">
                    <TrendingUp className="w-4 h-4" />
                    Top Skills in Pod
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topExpertise.map(([skill, count]) => (
                      <div key={skill} className="flex items-center gap-1.5 bg-accent/15 text-accent px-3 py-1.5 rounded-full text-sm font-medium">
                        <span>{skill}</span>
                        <span className="text-xs opacity-70">×{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {topGrowth.length > 0 && (
              <Card className="bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                    <BookOpen className="w-4 h-4" />
                    People Want to Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topGrowth.map(([skill, count]) => (
                      <div key={skill} className="flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
                        <span>{skill}</span>
                        <span className="text-xs opacity-70">×{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Members List */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Pod Members
              </CardTitle>
              <span className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member, index) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 rounded-xl bg-card shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {(member.name || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-foreground truncate">
                          {member.name}
                        </h4>
                        {member.userId === currentUserId && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary text-xs px-1.5">You</Badge>
                        )}
                        {member.lookingToHelp && member.userId !== currentUserId && (
                          <span title="Looking to help">
                            <Sparkles className="w-4 h-4 text-accent" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{member.department || "No department"}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2 mb-3">
                    {member.expertiseSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {member.expertiseSkills.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="text-sm bg-accent/15 text-accent px-2.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {member.expertiseSkills.length > 3 && (
                          <span
                            className="text-sm bg-muted text-muted-foreground px-2.5 py-0.5 rounded cursor-help"
                            title={member.expertiseSkills.slice(3).join(', ')}
                          >
                            +{member.expertiseSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {member.userId !== currentUserId && (
                    <Button
                      onClick={() => openNudgeDialog(member)}
                      size="sm"
                      variant="outline"
                      className="w-full hover:bg-primary/10 hover:border-primary/50"
                    >
                      <Bell className="h-4 w-4 mr-1.5" />
                      Nudge
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {selectedMember && (
        <NudgeDialog
          open={nudgeDialogOpen}
          onClose={() => setNudgeDialogOpen(false)}
          member={{
            userId: selectedMember.userId,
            name: selectedMember.name,
            expertiseSkills: selectedMember.expertiseSkills,
          }}
          currentUserExpertise={currentUserExpertise}
          onNudge={handleNudge}
        />
      )}
    </>
  );
}
