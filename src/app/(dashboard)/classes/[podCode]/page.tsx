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
import { Loader2, ArrowLeft, Users, Copy, Check, Bell, Sparkles } from "lucide-react";
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
            major: profile?.major,
            bio: profile?.bio,
            expertiseSkills: profile?.expertise_skills || [],
            growthSkills: profile?.growth_skills || [],
            lookingToHelp: profile?.looking_to_help || false,
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
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
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
        <Card className="shadow-md border-2 border-teal-100">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">{pod.pod_name}</CardTitle>
                <CardDescription className="text-base">
                  {pod.business_unit || "General"} • {members.length} {members.length === 1 ? 'member' : 'members'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-teal-50 px-3 py-1.5 rounded-lg border-2 border-teal-200 font-mono text-base font-bold text-teal-700">
                  {pod.pod_code}
                </div>
                <Button 
                  onClick={copyPodCode} 
                  size="icon" 
                  variant="outline"
                  className="hover:bg-teal-50 h-9 w-9"
                >
                  {copied ? <Check className="h-4 w-4 text-teal-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Members List - Simpler, More Compact */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Pod Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl border hover:border-teal-200 hover:bg-teal-50/30 transition-all"
                >
                  <Avatar className="h-10 w-10 border-2 border-teal-100 shrink-0">
                    <AvatarFallback className="bg-teal-100 text-teal-700 font-semibold text-sm">
                      {(member.major || member.department || '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {member.major || "Team Member"}
                      </h4>
                      {member.userId === currentUserId && (
                        <Badge variant="secondary" className="bg-teal-100 text-teal-700 text-xs">You</Badge>
                      )}
                      {member.lookingToHelp && member.userId !== currentUserId && (
                        <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Looking to Help
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{member.department || "No department"}</p>
                    
                    {/* Skills Preview */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {member.expertiseSkills.slice(0, 4).map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs bg-gray-100 text-gray-700 px-2 py-0">
                          {skill}
                        </Badge>
                      ))}
                      {member.expertiseSkills.length > 4 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600 px-2 py-0">
                          +{member.expertiseSkills.length - 4}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {member.userId !== currentUserId && (
                    <Button
                      onClick={() => openNudgeDialog(member)}
                      size="sm"
                      variant="outline"
                      className="shrink-0 hover:bg-teal-50 hover:border-teal-300"
                    >
                      <Bell className="h-3.5 w-3.5 mr-1" />
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
