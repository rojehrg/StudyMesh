"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { analyzeTeamComposition, TeamAnalysis } from "@/lib/logic/matching";
import { NudgeDialog } from "@/components/nudge-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Users, Copy, Check, Bell, Sparkles, BarChart3, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [senderName, setSenderName] = useState<string>("A teammate");
  const [teamAnalysis, setTeamAnalysis] = useState<TeamAnalysis | null>(null);

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
        .select('expertise_skills, major')
        .eq('user_id', user.id)
        .single();
      
      setCurrentUserExpertise(currentProfile?.expertise_skills || []);
      setSenderName(currentProfile?.major || "A teammate");

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
            major: profile?.major,
            bio: profile?.bio,
            expertiseSkills: profile?.expertise_skills || [],
            growthSkills: profile?.growth_skills || [],
            lookingToHelp: profile?.looking_to_help || false,
            slackHandle: profile?.slack_handle || "",
          };
        });

        setMembers(membersWithProfiles);

        // Analyze team composition
        if (profiles && profiles.length > 0) {
          const analysisProfiles = profiles.map(p => ({
            expertiseSkills: p.expertise_skills || [],
            growthSkills: p.growth_skills || [],
            department: p.department,
          }));
          const analysis = analyzeTeamComposition(analysisProfiles);
          setTeamAnalysis(analysis);
        }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pod) return null;

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

        {/* Pod Header - More Compact */}
        <Card className="shadow-md border-2 border-primary/20">
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

        {/* Team Analysis Card */}
        {teamAnalysis && members.length > 1 && (
          <Card className="border-2 border-purple-500/20 dark:border-purple-400/20 bg-purple-500/5 dark:bg-purple-400/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Team Skill Analysis
              </CardTitle>
              <CardDescription>
                Skill coverage and recommendations for your pod
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Balance Score */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">Skill Balance</span>
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-400">{teamAnalysis.balanceScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${teamAnalysis.balanceScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Strong Areas & Gaps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamAnalysis.strongAreas.length > 0 && (
                  <div className="p-3 bg-green-500/10 dark:bg-green-400/10 border border-green-500/30 dark:border-green-400/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Strong Areas</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teamAnalysis.strongAreas.slice(0, 4).map(area => (
                        <Badge key={area} variant="secondary" className="bg-green-500/20 dark:bg-green-400/20 text-green-700 dark:text-green-400 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {teamAnalysis.gapAreas.length > 0 && (
                  <div className="p-3 bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Gap Areas</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teamAnalysis.gapAreas.slice(0, 4).map(area => (
                        <Badge key={area} variant="secondary" className="bg-amber-500/20 dark:bg-amber-400/20 text-amber-700 dark:text-amber-400 text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Top Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teamAnalysis.topExpertise.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Top Team Expertise
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {teamAnalysis.topExpertise.slice(0, 4).map(item => (
                        <span key={item.skill} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {item.skill} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {teamAnalysis.topGrowthNeeds.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Learning Goals
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {teamAnalysis.topGrowthNeeds.slice(0, 4).map(item => (
                        <span key={item.skill} className="text-xs bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded">
                          {item.skill} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {teamAnalysis.recommendations.length > 0 && (
                <div className="pt-2 border-t border-purple-500/20 dark:border-purple-400/20">
                  <p className="text-xs uppercase tracking-wider text-purple-600 dark:text-purple-400 font-medium mb-2">Recommendations</p>
                  <ul className="space-y-1">
                    {teamAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Members List - Compact Grid Layout */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Pod Members
              </CardTitle>
              <span className="text-sm text-muted-foreground">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-3 ${members.length > 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
              {members.map((member, index) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -2 }}
                  className="p-3 rounded-xl border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all bg-card"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 border-2 border-primary/20 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {(member.major || member.department || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-foreground text-sm truncate max-w-[120px]">
                          {member.major || "Team Member"}
                        </h4>
                        {member.userId === currentUserId && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px] px-1.5 py-0">You</Badge>
                        )}
                        {member.lookingToHelp && member.userId !== currentUserId && (
                          <span title="Looking to Help">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.department || "No department"}</p>

                      {/* Skills - Compact */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {member.expertiseSkills.slice(0, 2).map((skill: string) => (
                          <span key={skill} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {member.expertiseSkills.length > 2 && (
                          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            +{member.expertiseSkills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {member.userId !== currentUserId && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                      <Button
                        onClick={() => openNudgeDialog(member)}
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs hover:bg-primary/10 hover:border-primary/50"
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Nudge
                      </Button>
                      {member.slackHandle && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-primary hover:bg-primary/10"
                          onClick={() => {
                            const handle = member.slackHandle.trim();
                            const isId = handle.startsWith("U") || handle.startsWith("W");
                            const href = isId
                              ? `https://slack.com/app_redirect?channel=${handle}`
                              : undefined;
                            if (href) {
                              window.open(href, "_blank");
                            } else {
                              navigator.clipboard.writeText(handle.replace("@", ""));
                              toast.success("Slack handle copied");
                            }
                          }}
                          title="Message on Slack"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                          </svg>
                        </Button>
                      )}
                    </div>
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
