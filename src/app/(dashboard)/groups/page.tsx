"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { NudgeDialog } from "@/components/nudge-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Sparkles, Bell, Users, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function WorkingCirclesPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserExpertise, setCurrentUserExpertise] = useState<string[]>([]);
  const [nudgeDialogOpen, setNudgeDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [requestSkill, setRequestSkill] = useState("");
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadPodMembers();
  }, []);

  const loadPodMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return;

      setCurrentProfile(currentProfile);
      setCurrentUserExpertise(currentProfile.expertise_skills || []);

      // Get all pods user is in
      const { data: userPods } = await supabase
        .from('pod_members')
        .select('pod_id')
        .eq('user_id', user.id);

      if (!userPods || userPods.length === 0) {
        setMembers([]);
        return;
      }

      const podIds = userPods.map(p => p.pod_id);

      // Get all members from those pods (excluding current user)
      const { data: allPodMembers } = await supabase
        .from('pod_members')
        .select('user_id, pod_id')
        .in('pod_id', podIds)
        .neq('user_id', user.id);

      if (!allPodMembers || allPodMembers.length === 0) {
        setMembers([]);
        return;
      }

      // Get unique user IDs
      const uniqueUserIds = [...new Set(allPodMembers.map(m => m.user_id))];

      // Get profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', uniqueUserIds);

      if (!profiles) return;

      // Get pod names for context
      const { data: pods } = await supabase
        .from('pods')
        .select('id, pod_name')
        .in('id', podIds);

      const podMap = new Map(pods?.map(p => [p.id, p.pod_name]) || []);

      // Build member list with their pods
      const memberList = profiles.map(profile => {
        const memberPodIds = allPodMembers
          .filter(m => m.user_id === profile.user_id)
          .map(m => m.pod_id);

        const memberPodNames = memberPodIds
          .map(id => podMap.get(id))
          .filter(Boolean);

        return {
          userId: profile.user_id,
          major: profile.major,
          department: profile.department,
          expertiseSkills: profile.expertise_skills || [],
          growthSkills: profile.growth_skills || [],
          lookingToHelp: profile.looking_to_help || false,
          slackHandle: profile.slack_handle || "",
          pods: memberPodNames,
        };
      });

      setMembers(memberList);

      // Load open requests
      const { data: requests } = await supabase
        .from('open_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setOpenRequests(requests || []);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
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
        metadata: { topic, nudge_type: type },
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

  const saveOpenRequest = async () => {
    if (!requestSkill.trim()) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const skill = requestSkill.trim();
      const { error } = await supabase.from('open_requests').insert({
        user_id: user.id,
        skill,
        status: 'open',
      });
      if (error) throw error;
      setRequestSkill("");
      toast.success("Request saved", { description: `We'll notify you when someone can help with ${skill}.` });
      loadPodMembers();
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Failed to save request");
    }
  };

  const filteredMembers = members.filter(m =>
    m.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.expertiseSkills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    m.growthSkills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Simple matching: find people who have skills I want to learn
  const canHelpMe = members.filter(m => {
    const myGrowth = currentProfile?.growth_skills || [];
    return m.expertiseSkills.some((skill: string) =>
      myGrowth.some((g: string) => g.toLowerCase() === skill.toLowerCase())
    );
  });

  // Simple matching: find people whose growth needs match my expertise
  const iCanHelp = members.filter(m => {
    const myExpertise = currentProfile?.expertise_skills || [];
    return m.growthSkills.some((skill: string) =>
      myExpertise.some((e: string) => e.toLowerCase() === skill.toLowerCase())
    );
  });

  const myRequests = openRequests.filter(r => currentProfile && r.user_id === currentProfile.user_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Working Circles</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-1">
          People from your pods
        </p>
      </div>

      {/* Help Requests */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-ctp-peach" />
            Need Help With Something?
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Add skills you need help with - we'll match you with pod members who can help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. SQL, React hooks, presenting..."
              value={requestSkill}
              onChange={(e) => setRequestSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveOpenRequest()}
              className="h-9 text-sm"
            />
            <Button onClick={saveOpenRequest} size="sm" className="bg-ctp-peach hover:bg-ctp-peach/80 h-9">
              Add
            </Button>
          </div>
          {myRequests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {myRequests.map(r => (
                <div key={r.id} className="flex items-center gap-1.5 bg-ctp-peach/10 text-ctp-peach px-3 py-1.5 rounded-full text-sm">
                  <span>{r.skill}</span>
                  <button
                    onClick={async () => {
                      await supabase.from('open_requests').delete().eq('id', r.id);
                      setOpenRequests(openRequests.filter(req => req.id !== r.id));
                      toast.success("Request removed");
                    }}
                    className="hover:text-ctp-red ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {(canHelpMe.length > 0 || iCanHelp.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {canHelpMe.length > 0 && (
            <Card className="bg-ctp-green/5">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-ctp-green mb-1">Can help you</p>
                <p className="text-2xl font-bold text-foreground">{canHelpMe.length}</p>
                <p className="text-xs text-muted-foreground">people have skills you want to learn</p>
              </CardContent>
            </Card>
          )}
          {iCanHelp.length > 0 && (
            <Card className="bg-ctp-peach/5">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-ctp-peach mb-1">You can help</p>
                <p className="text-2xl font-bold text-foreground">{iCanHelp.length}</p>
                <p className="text-xs text-muted-foreground">people want to learn your skills</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      {members.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, department, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {(member.major || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground truncate">
                          {member.major || "Team Member"}
                        </p>
                        {member.lookingToHelp && (
                          <span title="Looking to help">
                            <Sparkles className="w-4 h-4 text-ctp-peach shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.department}</p>
                    </div>
                  </div>

                  {/* Pod badges */}
                  {member.pods.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {member.pods.slice(0, 2).map((pod: string) => (
                        <Badge key={pod} variant="secondary" className="text-xs bg-muted">
                          {pod}
                        </Badge>
                      ))}
                      {member.pods.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-muted">
                          +{member.pods.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Skills */}
                  <div className="space-y-2 mb-3">
                    {member.expertiseSkills.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Knows</p>
                        <div className="flex flex-wrap gap-1">
                          {member.expertiseSkills.slice(0, 4).map((skill: string) => (
                            <span key={skill} className="bg-ctp-peach/15 text-ctp-peach text-xs px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {member.expertiseSkills.length > 4 && (
                            <span className="text-xs text-muted-foreground">+{member.expertiseSkills.length - 4}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {member.growthSkills.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Wants to learn</p>
                        <div className="flex flex-wrap gap-1">
                          {member.growthSkills.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="bg-ctp-green/15 text-ctp-green text-xs px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {member.growthSkills.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{member.growthSkills.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <Button
                    onClick={() => openNudgeDialog(member)}
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs hover:bg-primary/10 hover:border-primary/50"
                  >
                    <Bell className="mr-1.5 h-3 w-3" />
                    Nudge
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card className="bg-primary/5 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5"
            >
              <Users className="w-10 h-10 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Pod Members Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Join a pod to see your teammates here and start collaborating.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/classes/join">Join with Code</a>
              </Button>
              <Button className="bg-ctp-peach hover:bg-ctp-peach/80" asChild>
                <a href="/classes/create">Create a Pod</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No members found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}

      {selectedMember && (
        <NudgeDialog
          open={nudgeDialogOpen}
          onClose={() => setNudgeDialogOpen(false)}
          member={{
            userId: selectedMember.userId,
            name: selectedMember.major || "Team Member",
            expertiseSkills: selectedMember.expertiseSkills,
          }}
          currentUserExpertise={currentUserExpertise}
          onNudge={handleNudge}
        />
      )}
    </motion.div>
  );
}
