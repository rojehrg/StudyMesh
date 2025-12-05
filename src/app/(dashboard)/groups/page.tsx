"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateMatches } from "@/lib/logic/matching";
import { NudgeDialog } from "@/components/nudge-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Sparkles, Bell, Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function WorkingCirclesPage() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserExpertise, setCurrentUserExpertise] = useState<string[]>([]);
  const [nudgeDialogOpen, setNudgeDialogOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [requestSkill, setRequestSkill] = useState("");
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadAllMatches();
  }, []);

  const loadAllMatches = async () => {
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
        setMatches([]);
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
        setMatches([]);
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

      // Calculate matches
      const matchResults = profiles
        .map(otherProfile => {
          const result = calculateMatches(
            {
              expertiseSkills: currentProfile.expertise_skills || [],
              growthSkills: currentProfile.growth_skills || [],
            },
            {
              expertiseSkills: otherProfile.expertise_skills || [],
              growthSkills: otherProfile.growth_skills || [],
            }
          );

          // Find which pods they share
          const sharedPodIds = allPodMembers
            .filter(m => m.user_id === otherProfile.user_id)
            .map(m => m.pod_id);

          return {
            userId: otherProfile.user_id,
            major: otherProfile.major,
            department: otherProfile.department,
            expertiseSkills: otherProfile.expertise_skills || [],
            lookingToHelp: otherProfile.looking_to_help || false,
            slackHandle: otherProfile.slack_handle || "",
            score: result.score,
            canHelp: result.skills.a_to_b,
            canAskHelp: result.skills.b_to_a,
            sharedPods: sharedPodIds.length,
          };
        })
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);

      setMatches(matchResults);
      
      // Load open requests
      const { data: requests } = await supabase
        .from('open_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setOpenRequests(requests || []);
    } catch (error) {
      console.error("Error loading matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNudgeDialog = (match: any) => {
    setSelectedMatch(match);
    setNudgeDialogOpen(true);
  };

  const handleNudge = async (recipientId: string, topic: string, type: 'ask' | 'offer') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('major, department')
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
      const slackHandle = selectedMatch?.slackHandle;
      if (slackHandle) {
        fetch('/api/slack/nudge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientSlackHandle: slackHandle,
            senderName,
            topic,
          }),
        }).catch(() => {});
      }

      toast.success("Nudge sent!", {
        description: type === 'ask' ? `Asked for help with ${topic}` : `Offered help with ${topic}`
      });
    } catch (error) {
      console.error("Error sending nudge:", error);
      toast.error("Failed to send nudge", {
        description: "Please try again"
      });
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
      toast.success("Request saved", { description: `We'll notify you when someone with ${skill} joins.` });
      loadAllMatches(); // refresh
    } catch (error) {
      console.error("Error saving request:", error);
      toast.error("Failed to save request");
    }
  };

  const notifyRequester = async (request: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const content = `Someone can help with ${request.skill}`;
      const { error } = await supabase.from('notifications').insert({
        recipient_id: request.user_id,
        sender_id: user.id,
        type: 'nudge',
        content,
        metadata: { topic: request.skill, request_id: request.id },
        read: false,
      });
      if (error) throw error;
      await supabase.from('open_requests').update({ status: 'notified' }).eq('id', request.id);
      toast.success("Requester notified");
      setOpenRequests(openRequests.map(r => r.id === request.id ? { ...r, status: 'notified' } : r));
    } catch (error) {
      console.error("Error notifying requester:", error);
      toast.error("Failed to notify requester");
    }
  };

  const filteredMatches = matches.filter(m =>
    m.major?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.canHelp.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    m.canAskHelp.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const requestsICanHelp = openRequests.filter(r => r.status === 'open' && currentProfile && r.user_id !== currentProfile.user_id &&
    (currentProfile.expertise_skills || []).some((s: string) => s.toLowerCase().includes((r.skill || "").toLowerCase())));
  const myRequests = openRequests.filter(r => currentProfile && r.user_id === currentProfile.user_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
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
        <h1 className="text-2xl font-bold text-gray-900">Working Circles</h1>
        <p className="text-gray-500 mt-1">
          Your potential knowledge-sharing partners across all pods
        </p>
      </div>

      {matches.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, department, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Open Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            Open Help Requests
          </CardTitle>
          <CardDescription>Save what you need help with; we’ll notify you when someone can help.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Skill you need help with"
              value={requestSkill}
              onChange={(e) => setRequestSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveOpenRequest()}
            />
            <Button onClick={saveOpenRequest} variant="outline">Save request</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-800">Requests I created</div>
              {myRequests.length === 0 ? (
                <p className="text-sm text-gray-500">No saved requests.</p>
              ) : myRequests.map(r => (
                <div key={r.id} className="p-3 rounded-xl border bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.skill}</p>
                    <p className="text-xs text-gray-500">Status: {r.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-800">Requests I can help with</div>
              {requestsICanHelp.length === 0 ? (
                <p className="text-sm text-gray-500">No matching requests right now.</p>
              ) : requestsICanHelp.map(r => (
                <div key={r.id} className="p-3 rounded-xl border bg-teal-50/40 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.skill}</p>
                    <p className="text-xs text-gray-500">Someone needs help</p>
                  </div>
                  <Button size="sm" onClick={() => notifyRequester(r)} className="bg-teal-600 hover:bg-teal-700">
                    Notify requester
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover-lift h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-teal-100">
                        <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold">
                          {(match.major || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{match.major || "Team Member"}</CardTitle>
                          {match.lookingToHelp && (
                            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Looking to Help
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{match.department}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                        {match.score}% match
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {match.sharedPods} {match.sharedPods === 1 ? 'pod' : 'pods'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {match.canHelp.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-teal-700 mb-2">You can help with:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.canHelp.map((skill: string) => (
                          <Badge key={skill} className="bg-teal-50 text-teal-700 border-teal-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.canAskHelp.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-cyan-700 mb-2">They can help you with:</p>
                      <div className="flex flex-wrap gap-2">
                        {match.canAskHelp.map((skill: string) => (
                          <Badge key={skill} className="bg-cyan-50 text-cyan-700 border-cyan-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button
                      onClick={() => openNudgeDialog(match)}
                      variant="outline"
                      size="sm"
                      className="w-full hover:bg-teal-50 hover:border-teal-300"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Send Nudge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-500 max-w-sm mb-4">
              Join pods and update your skills in Settings to find knowledge-sharing partners.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No matches found for "{searchQuery}"</p>
          </CardContent>
        </Card>
      )}

      {selectedMatch && (
        <NudgeDialog
          open={nudgeDialogOpen}
          onClose={() => setNudgeDialogOpen(false)}
          member={{
            userId: selectedMatch.userId,
            name: selectedMatch.major || "Team Member",
            expertiseSkills: selectedMatch.expertiseSkills,
          }}
          currentUserExpertise={currentUserExpertise}
          onNudge={handleNudge}
        />
      )}
    </motion.div>
  );
}

