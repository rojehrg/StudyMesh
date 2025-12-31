"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { NudgeDialog } from "@/components/nudge-dialog";
import { ScheduleMeetingDialog } from "@/components/schedule-meeting-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CircleNotch, ArrowLeft, Users, Copy, Check, Bell, Sparkle, TrendUp, BookOpen, Globe, Shield, Lightning, Clock } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PodDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const podCode = params.podCode as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [pod, setPod] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [nudgeDialogOpen, setNudgeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isManager, setIsManager] = useState(false);
  const [allowCrossPodHelp, setAllowCrossPodHelp] = useState(true);
  const [scheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);
  const [scheduleWithUserId, setScheduleWithUserId] = useState<string | null>(null);

  useEffect(() => {
    loadPodData();
  }, [podCode]);

  // Handle schedule query parameter from nudge acceptance
  useEffect(() => {
    const scheduleUserId = searchParams.get('schedule');
    if (scheduleUserId && pod && members.length > 0) {
      // Check if this user is in the pod
      const memberExists = members.some(m => m.userId === scheduleUserId);
      if (memberExists) {
        setScheduleWithUserId(scheduleUserId);
        setScheduleMeetingOpen(true);
        // Clear the query parameter from URL
        router.replace(`/classes/${podCode}`, { scroll: false });
      }
    }
  }, [searchParams, pod, members, podCode, router]);

  const loadPodData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUserId(user.id);

      // Get current user's profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('expertise_skills, knowledge_areas, timezone, availability')
        .eq('user_id', user.id)
        .single();

      setCurrentUserProfile({
        userId: user.id,
        expertiseSkills: currentProfile?.expertise_skills || [],
        knowledgeAreas: currentProfile?.knowledge_areas || [],
        timezone: currentProfile?.timezone || 'America/New_York',
        availabilitySlots: currentProfile?.availability?.slots || [],
      });

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
      setIsManager(podData.manager_id === user.id || podData.created_by === user.id);
      setAllowCrossPodHelp(podData.allow_cross_pod_help !== false);

      // Get pod members with profiles
      const { data: podMembers } = await supabase
        .from('pod_members')
        .select('user_id, joined_at')
        .eq('pod_id', podData.id);

      if (podMembers && podMembers.length > 0) {
        const userIds = podMembers.map(pm => pm.user_id);

        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, major, department, expertise_skills, knowledge_areas, growth_skills, slack_handle, timezone, availability')
          .in('user_id', userIds);

        const membersWithProfiles = podMembers.map(pm => {
          const profile = profiles?.find(p => p.user_id === pm.user_id);
          // Build display name from first_name and last_name, fallback to major or "Team Member"
          const displayName = profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.first_name || profile?.major || "Team Member";
          return {
            userId: pm.user_id,
            joinedAt: pm.joined_at,
            name: displayName,
            firstName: profile?.first_name,
            lastName: profile?.last_name,
            role: profile?.major, // Keep role/title separate
            department: profile?.department,
            expertiseSkills: profile?.expertise_skills || [],
            knowledgeAreas: profile?.knowledge_areas || [],
            growthSkills: profile?.growth_skills || [],
            lookingToHelp: profile?.availability?.lookingToHelp || false,
            slackHandle: profile?.slack_handle || "",
            slackConnected: !!(profile?.slack_handle),
            timezone: profile?.timezone || "America/New_York",
            availabilitySlots: profile?.availability?.slots || [],
            currentlyAvailable: profile?.availability?.currentlyAvailable || false,
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

  const updateCrossPodHelp = async (enabled: boolean) => {
    try {
      const response = await fetch(`/api/pods/${podCode}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow_cross_pod_help: enabled }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      setAllowCrossPodHelp(enabled);
      toast.success(enabled ? "Cross-pod help enabled" : "Cross-pod help disabled");
    } catch (error) {
      console.error("Error updating pod settings:", error);
      toast.error("Failed to update settings");
    }
  };

  const openNudgeDialog = (member: any) => {
    setSelectedMember(member);
    setNudgeDialogOpen(true);
  };

  const handleNudge = async (data: {
    recipientId: string;
    topic: string;
    type: 'ask' | 'offer';
    meetingLength: '15min' | '30min' | '1hr' | 'async';
    suggestedTime?: string;
    message: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('major')
        .eq('user_id', user.id)
        .single();

      const senderName = senderProfile?.major || "A teammate";

      const { error } = await supabase.from('notifications').insert({
        recipient_id: data.recipientId,
        sender_id: user.id,
        type: 'nudge',
        content: data.message,
        metadata: {
          topic: data.topic,
          pod_id: pod.id,
          pod_code: pod.pod_code,
          nudge_type: data.type,
          meeting_length: data.meetingLength,
          suggested_time: data.suggestedTime,
        },
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
            topic: data.topic,
            podCode: pod?.pod_code,
            nudgeType: data.type,
            meetingLength: data.meetingLength,
            suggestedTime: data.suggestedTime,
            message: data.message,
          }),
        }).catch(() => {});
      }

      toast.success("Nudge sent!", {
        description: data.type === 'ask' ? `Asked for help with ${data.topic}` : `Offered help with ${data.topic}`
      });
    } catch (error) {
      console.error("Error sending nudge:", error);
      toast.error("Failed to send nudge");
      throw error;
    }
  };

  // Calculate simple skill stats - memoized to avoid recalculation on every render
  const { topExpertise, topGrowth } = useMemo(() => {
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
  }, [members]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <CircleNotch className="w-8 h-8 animate-spin text-primary" weight="duotone" />
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
              <ArrowLeft className="mr-2 h-4 w-4" weight="duotone" />
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
                  {copied ? <Check className="h-4 w-4 text-primary" weight="duotone" /> : <Copy className="h-4 w-4" weight="duotone" />}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Manager Settings */}
        {isManager && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" weight="duotone" />
                Pod Manager Settings
              </CardTitle>
              <CardDescription>
                You created this pod. Manage settings here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-card rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-primary" weight="duotone" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground">Allow Cross-Pod Help</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Members can receive help requests from people outside this pod
                    </p>
                  </div>
                </div>
                <Switch
                  checked={allowCrossPodHelp}
                  onCheckedChange={updateCrossPodHelp}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Currently Available in Pod */}
        {members.filter(m => m.currentlyAvailable && m.userId !== currentUserId).length > 0 && (
          <Card className="bg-success/5 border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-success">
                <Lightning className="w-5 h-5" weight="duotone" />
                Available Now
              </CardTitle>
              <CardDescription>These teammates are online and ready to help</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {members
                  .filter(m => m.currentlyAvailable && m.userId !== currentUserId)
                  .map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center gap-2 px-3 py-2 bg-success/10 rounded-lg cursor-pointer hover:bg-success/20 transition-colors"
                      onClick={() => openNudgeDialog(member)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-success/20 text-success text-sm font-semibold">
                          {(member.name || 'T')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" weight="duotone" />
                          Available now
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simple Skill Overview */}
        {members.length > 1 && (topExpertise.length > 0 || topGrowth.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topExpertise.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                    <TrendUp className="w-4 h-4" weight="duotone" />
                    Top Skills in Pod
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topExpertise.map(([skill, count]) => (
                      <Badge key={skill} variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium bg-primary/15 text-primary">
                        <span>{skill}</span>
                        <span className="text-xs opacity-70">×{count}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {topGrowth.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-success">
                    <BookOpen className="w-4 h-4" weight="duotone" />
                    People Want to Learn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {topGrowth.map(([skill, count]) => (
                      <Badge key={skill} variant="secondary" className="gap-1.5 px-3 py-1.5 text-sm font-medium bg-success/15 text-success">
                        <span>{skill}</span>
                        <span className="text-xs opacity-70">×{count}</span>
                      </Badge>
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
                  className={`p-4 rounded-xl border transition-all ${
                    member.currentlyAvailable && member.userId !== currentUserId
                      ? "bg-success/5 border-success/20 hover:border-success/40"
                      : "bg-card border-border hover:border-primary/30 hover:shadow-md"
                  }`}
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
                        {member.currentlyAvailable && member.userId !== currentUserId && (
                          <Badge className="bg-success/20 text-success text-xs px-1.5 border-0 gap-0.5">
                            <Lightning className="w-3 h-3" />
                            Now
                          </Badge>
                        )}
                        {member.lookingToHelp && member.userId !== currentUserId && !member.currentlyAvailable && (
                          <span title="Looking to help">
                            <Sparkle className="w-4 h-4 text-accent" weight="duotone" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.role && member.department
                          ? `${member.role} • ${member.department}`
                          : member.role || member.department || "Team Member"}
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2 mb-3">
                    {member.expertiseSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {member.expertiseSkills.slice(0, 3).map((skill: string) => (
                          <span key={skill} className="text-sm bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary px-2.5 py-0.5 rounded font-medium">
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

      {selectedMember && currentUserProfile && (
        <NudgeDialog
          open={nudgeDialogOpen}
          onClose={() => setNudgeDialogOpen(false)}
          member={{
            userId: selectedMember.userId,
            name: selectedMember.name,
            knowledgeAreas: selectedMember.knowledgeAreas || selectedMember.expertiseSkills || [],
            timezone: selectedMember.timezone,
            availabilitySlots: selectedMember.availabilitySlots,
            currentlyAvailable: selectedMember.currentlyAvailable,
            slackConnected: selectedMember.slackConnected,
          }}
          currentUser={{
            userId: currentUserProfile.userId,
            knowledgeAreas: currentUserProfile.knowledgeAreas || currentUserProfile.expertiseSkills || [],
            timezone: currentUserProfile.timezone,
            availabilitySlots: currentUserProfile.availabilitySlots,
          }}
          onNudge={handleNudge}
        />
      )}

      {/* Schedule Meeting Dialog - auto-opened from nudge acceptance */}
      {pod && (
        <ScheduleMeetingDialog
          open={scheduleMeetingOpen}
          onOpenChange={(open) => {
            setScheduleMeetingOpen(open);
            if (!open) setScheduleWithUserId(null);
          }}
          onSuccess={() => {
            setScheduleMeetingOpen(false);
            setScheduleWithUserId(null);
          }}
          preselectedPodId={pod.id}
          preselectedUserIds={scheduleWithUserId ? [scheduleWithUserId] : []}
        />
      )}
    </>
  );
}
