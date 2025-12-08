"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { calculateMatches, calculateSimilarity } from "@/lib/logic/matching";
import { NudgeDialog } from "@/components/nudge-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Sparkles, Bell, Users, X, ChevronDown, Target, Building2, Clock, ArrowLeftRight, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [similarUsers, setSimilarUsers] = useState<any[]>([]);
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
          // Find which pods they share
          const sharedPodIds = allPodMembers
            .filter(m => m.user_id === otherProfile.user_id)
            .map(m => m.pod_id);

          const isSamePod = sharedPodIds.length > 0;

          const result = calculateMatches(
            {
              expertiseSkills: currentProfile.expertise_skills || [],
              growthSkills: currentProfile.growth_skills || [],
              department: currentProfile.department,
              availability: currentProfile.availability,
            },
            {
              expertiseSkills: otherProfile.expertise_skills || [],
              growthSkills: otherProfile.growth_skills || [],
              department: otherProfile.department,
              availability: otherProfile.availability,
              updatedAt: otherProfile.updated_at, // For freshness decay
              lookingToHelp: otherProfile.looking_to_help, // For active helper boost
            },
            isSamePod
          );

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
            breakdown: result.breakdown,
            isReciprocal: result.isReciprocal,
          };
        })
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score);

      setMatches(matchResults);

      // Calculate "Similar to you" recommendations
      const similarResults = profiles
        .map(otherProfile => {
          const similarity = calculateSimilarity(
            {
              expertiseSkills: currentProfile.expertise_skills || [],
              growthSkills: currentProfile.growth_skills || [],
              department: currentProfile.department,
            },
            {
              expertiseSkills: otherProfile.expertise_skills || [],
              growthSkills: otherProfile.growth_skills || [],
              department: otherProfile.department,
            }
          );

          return {
            userId: otherProfile.user_id,
            major: otherProfile.major,
            department: otherProfile.department,
            score: similarity.score,
            sharedExpertise: similarity.sharedExpertise,
            sharedGrowth: similarity.sharedGrowth,
            sharedCategory: similarity.sharedCategory,
          };
        })
        .filter(s => s.score >= 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setSimilarUsers(similarResults);

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
            nudgeType: type,
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
          Your potential knowledge-sharing partners across all pods
        </p>
      </div>

      {matches.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, department, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Help Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* My Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              My Help Requests
            </CardTitle>
            <CardDescription className="text-xs">
              Jot down what you need help with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. SQL optimization, React hooks..."
                value={requestSkill}
                onChange={(e) => setRequestSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveOpenRequest()}
                className="h-9 text-sm"
              />
              <Button onClick={saveOpenRequest} size="sm" className="bg-ctp-peach hover:bg-peach-400 h-9">
                Add
              </Button>
            </div>
            {myRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No requests yet. Add skills you need help with.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {myRequests.map(r => (
                  <div key={r.id} className={`p-2.5 rounded-lg flex items-center justify-between ${
                    r.status === 'notified' ? 'bg-primary/10 shadow-md' : 'bg-muted/50 shadow-sm'
                  }`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.skill}</p>
                      <p className={`text-xs ${r.status === 'notified' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {r.status === 'open' ? 'Waiting for match...' : r.status === 'notified' ? 'Someone can help!' : r.status}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        await supabase.from('open_requests').delete().eq('id', r.id);
                        setOpenRequests(openRequests.filter(req => req.id !== r.id));
                        toast.success("Request removed");
                      }}
                      className="text-muted-foreground hover:text-red-500 p-1 ml-2"
                      title="Remove request"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requests I Can Help */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-ctp-sky" />
              You Can Help
            </CardTitle>
            <CardDescription className="text-xs">
              People need help with skills you have
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestsICanHelp.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">No matching requests right now.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {requestsICanHelp.map(r => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-ctp-green/20 dark:bg-ctp-green/20 shadow-sm flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.skill}</p>
                      <p className="text-xs text-ctp-green dark:text-ctp-green">Someone needs your help</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => notifyRequester(r)}
                      className="bg-ctp-green hover:bg-green-400 h-7 text-xs px-3"
                    >
                      Offer help
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Similar to You Section */}
      {similarUsers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-ctp-mauve" />
              Similar to You
            </CardTitle>
            <CardDescription className="text-xs">
              People with similar skills and interests - great for collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {similarUsers.map((user) => (
                <div
                  key={user.userId}
                  className="flex items-center gap-2 p-2 pr-3 rounded-lg bg-ctp-surface0 dark:bg-ctp-surface1 hover:bg-ctp-surface1 dark:hover:bg-ctp-surface2 shadow-sm transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-ctp-surface1 dark:bg-ctp-surface2 text-ctp-text dark:text-ctp-text font-medium text-xs">
                      {(user.major || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.major || "Team Member"}</p>
                    <p className="text-[10px] text-ctp-subtext0 dark:text-ctp-subtext0">
                      {user.sharedExpertise.length > 0
                        ? `Shares: ${user.sharedExpertise.slice(0, 2).join(', ')}`
                        : user.sharedCategory.length > 0
                        ? `Both in: ${user.sharedCategory.slice(0, 2).join(', ')}`
                        : `${user.score}% similar`}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-ctp-surface1 dark:bg-ctp-surface2 text-ctp-text dark:text-ctp-text text-[10px] ml-1">
                    {user.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="p-4">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                        {(match.major || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground text-sm truncate">
                          {match.major || "Team Member"}
                        </p>
                        {match.lookingToHelp && (
                          <Sparkles className="w-3.5 h-3.5 text-ctp-peach shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{match.department}</p>
                    </div>
                    {/* Reciprocal Badge */}
                    {match.isReciprocal && (
                      <span className="flex items-center gap-0.5 bg-ctp-yellow/20 text-ctp-yellow text-[10px] px-1.5 py-0.5 rounded-full" title="Two-way match: you can help each other">
                        <ArrowLeftRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                    {/* Clickable Score Badge */}
                    <button
                      onClick={() => setExpandedCard(expandedCard === match.userId ? null : match.userId)}
                      className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full hover:bg-primary/20 transition-colors"
                    >
                      {match.score}%
                      <ChevronDown className={`w-3 h-3 transition-transform ${expandedCard === match.userId ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Expandable Score Breakdown */}
                  <AnimatePresence initial={false}>
                    {expandedCard === match.userId && match.breakdown && (
                      <motion.div
                        key="breakdown"
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{
                          duration: 0.2,
                          ease: [0.4, 0, 0.2, 1],
                          opacity: { duration: 0.15 }
                        }}
                        className="overflow-hidden"
                      >
                        <div className="p-2.5 bg-muted/50 rounded-lg shadow-sm">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Score Breakdown</p>
                          <div className="space-y-1.5">
                            {match.breakdown.skills > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Target className="w-3 h-3 text-primary" />
                                  Skill Match
                                </span>
                                <span className="font-medium text-primary">+{match.breakdown.skills}</span>
                              </div>
                            )}
                            {match.breakdown.samePod > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Users className="w-3 h-3 text-ctp-green" />
                                  Same Pod
                                </span>
                                <span className="font-medium text-ctp-green dark:text-ctp-green">+{match.breakdown.samePod}</span>
                              </div>
                            )}
                            {match.breakdown.crossDepartment > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Building2 className="w-3 h-3 text-ctp-subtext0" />
                                  Cross-Department
                                </span>
                                <span className="font-medium text-ctp-subtext1 dark:text-ctp-subtext0">+{match.breakdown.crossDepartment}</span>
                              </div>
                            )}
                            {match.breakdown.availability > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="w-3 h-3 text-ctp-yellow" />
                                  Availability
                                </span>
                                <span className="font-medium text-ctp-yellow">+{match.breakdown.availability}</span>
                              </div>
                            )}
                            {match.isReciprocal && (
                              <div className="flex items-center justify-between text-xs pt-1 mt-1">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <ArrowLeftRight className="w-3 h-3 text-ctp-yellow" />
                                  Two-Way Match
                                </span>
                                <span className="font-medium text-ctp-yellow">+5 bonus</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Skills - Compact */}
                  <div className="space-y-2 mb-3">
                    {match.canAskHelp.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-ctp-green dark:text-ctp-green font-medium mb-1">Can help you</p>
                        <div className="flex flex-wrap gap-1">
                          {match.canAskHelp.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="bg-ctp-green/20 dark:bg-ctp-green/20 text-ctp-green dark:text-ctp-green text-xs px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {match.canAskHelp.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{match.canAskHelp.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                    {match.canHelp.length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-primary font-medium mb-1">You can help</p>
                        <div className="flex flex-wrap gap-1">
                          {match.canHelp.slice(0, 3).map((skill: string) => (
                            <span key={skill} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {match.canHelp.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{match.canHelp.length - 3}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <Button
                    onClick={() => openNudgeDialog(match)}
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
      ) : matches.length === 0 ? (
        <Card className="bg-primary/5 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Working Circles!</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              This is where you'll find teammates who can help you grow and people you can mentor.
              Join a pod to start matching with colleagues.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <a href="/classes/join">Join with Code</a>
              </Button>
              <Button className="bg-ctp-peach hover:bg-peach-400" asChild>
                <a href="/classes/create">Create a Pod</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No matches found for "{searchQuery}"</p>
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

