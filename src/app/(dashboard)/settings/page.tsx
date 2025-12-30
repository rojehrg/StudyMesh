"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Check, User, Clock, Mail, Link2, Unlink, MessageCircle, Cloud, CloudOff, Sparkles, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AvailabilityGrid, type AvailabilitySlot } from "@/components/availability-grid";

// Common knowledge areas for suggestions
const SUGGESTED_KNOWLEDGE_AREAS = [
  "JavaScript", "TypeScript", "Python", "React", "Node.js", "SQL", "AWS",
  "Product Management", "Design", "Sales", "Marketing", "Data Analysis",
  "Machine Learning", "DevOps", "Customer Success", "Finance", "HR",
  "Copywriting", "SEO", "Growth", "Operations", "Legal", "Security",
];

// Consolidated profile type to avoid state sync issues
interface ProfileData {
  firstName: string;
  lastName: string;
  department: string;
  major: string;
  bio: string;
  knowledgeAreas: string[];
  timezone: string;
  availabilitySlots: AvailabilitySlot[];
  currentlyAvailable: boolean;
  lookingToHelp: boolean;
  email: string;
  emailNotifications: boolean;
  slackHandle: string;
  slackConnected: boolean;
  slackUserId: string;
}

const DEFAULT_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  department: "",
  major: "",
  bio: "",
  knowledgeAreas: [],
  timezone: "America/New_York",
  availabilitySlots: [],
  currentlyAvailable: false,
  lookingToHelp: false,
  email: "",
  emailNotifications: true,
  slackHandle: "",
  slackConnected: false,
  slackUserId: "",
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // Consolidated profile state - all editable fields in one place
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [knowledgeInput, setKnowledgeInput] = useState("");
  const [slackConnecting, setSlackConnecting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialLoad = useRef(true);

  const supabase = createClient();

  // Handle Slack OAuth callback result
  useEffect(() => {
    const slackStatus = searchParams.get('slack');
    if (slackStatus === 'success') {
      toast.success("Slack connected successfully!", {
        description: "You'll now receive meeting invites as direct messages."
      });
      window.history.replaceState({}, '', '/settings');
      loadProfile();
    } else if (slackStatus === 'cancelled') {
      toast.info("Slack connection cancelled");
      window.history.replaceState({}, '', '/settings');
    } else if (slackStatus === 'error') {
      const message = searchParams.get('message') || 'Unknown error';
      toast.error("Failed to connect Slack", {
        description: message === 'not_configured'
          ? "Slack OAuth is not configured for this workspace."
          : `Error: ${message}`
      });
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const loadedProfile: ProfileData = {
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          department: data.department || "",
          major: data.major || "",
          bio: data.bio || "",
          knowledgeAreas: data.knowledge_areas || data.expertise_skills || [],
          timezone: data.timezone || "America/New_York",
          availabilitySlots: data.availability?.slots || [],
          currentlyAvailable: data.availability?.currentlyAvailable || false,
          lookingToHelp: data.availability?.lookingToHelp || false,
          email: data.email || user.email || "",
          emailNotifications: data.email_notifications !== false,
          slackHandle: data.slack_handle || "",
          slackConnected: data.slack_connected || false,
          slackUserId: data.slack_user_id || "",
        };
        setProfile(loadedProfile);
        // Set the initial saved state to prevent immediate autosave
        lastSavedRef.current = JSON.stringify(loadedProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  };

  const saveProfile = useCallback(async (profileData: ProfileData) => {
    setSaveStatus('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          department: profileData.department,
          major: profileData.major,
          bio: profileData.bio,
          // Use expertise_skills column (knowledge_areas doesn't exist in DB)
          expertise_skills: profileData.knowledgeAreas || [],
          availability: {
            slots: profileData.availabilitySlots,
            currentlyAvailable: profileData.currentlyAvailable,
            lookingToHelp: profileData.lookingToHelp,
          },
          timezone: profileData.timezone,
          slack_handle: profileData.slackHandle || null,
          email: profileData.email,
          email_notifications: profileData.emailNotifications,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSaveStatus('saved');
      lastSavedRef.current = JSON.stringify(profileData);

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus('error');
      toast.error("Failed to save", {
        description: "Please try again."
      });
    }
  }, [supabase]);

  // Auto-save profile with debounce
  useEffect(() => {
    // Skip during initial load
    if (loading || isInitialLoad.current) return;

    const currentData = JSON.stringify(profile);
    if (currentData === lastSavedRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveProfile(profile);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [profile, loading, saveProfile]);

  // Update profile field helper
  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  // Handle looking to help toggle - uses consolidated state now
  const handleLookingToHelpChange = (checked: boolean) => {
    updateProfile({ lookingToHelp: checked });
    toast.success(checked ? "You'll appear as 'looking to help'" : "Status updated");
  };

  const addKnowledgeArea = (area?: string) => {
    const areaToAdd = area || knowledgeInput.trim();
    if (!areaToAdd) return;

    if (!profile.knowledgeAreas.includes(areaToAdd)) {
      updateProfile({
        knowledgeAreas: [...profile.knowledgeAreas, areaToAdd],
      });
    }
    setKnowledgeInput("");
  };

  const removeKnowledgeArea = (area: string) => {
    updateProfile({
      knowledgeAreas: profile.knowledgeAreas.filter((a: string) => a !== area),
    });
  };

  // Connect to Slack via OAuth
  const connectSlack = () => {
    setSlackConnecting(true);
    window.location.href = '/api/slack/oauth';
  };

  // Disconnect Slack
  const disconnectSlack = async () => {
    try {
      const response = await fetch('/api/slack/oauth', { method: 'POST' });
      if (response.ok) {
        updateProfile({ slackConnected: false, slackUserId: "", slackHandle: "" });
        toast.success("Slack disconnected");
      } else {
        toast.error("Failed to disconnect Slack");
      }
    } catch (error) {
      console.error("Error disconnecting Slack:", error);
      toast.error("Failed to disconnect Slack");
    }
  };

  // Get filtered suggestions (exclude already added)
  const filteredSuggestions = SUGGESTED_KNOWLEDGE_AREAS.filter(
    area => !profile.knowledgeAreas.includes(area) &&
            area.toLowerCase().includes(knowledgeInput.toLowerCase())
  ).slice(0, 6);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and availability</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {saveStatus === 'saving' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </motion.div>
          )}
          {saveStatus === 'saved' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-primary"
            >
              <Check className="h-4 w-4" />
              <span>Saved</span>
            </motion.div>
          )}
          {saveStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-destructive"
            >
              <CloudOff className="h-4 w-4" />
              <span>Error saving</span>
            </motion.div>
          )}
          {saveStatus === 'idle' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cloud className="h-4 w-4" />
              <span>Auto-save on</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Availability</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>How teammates will see you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={profile.firstName}
                    onChange={(e) => updateProfile({ firstName: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={profile.lastName}
                    onChange={(e) => updateProfile({ lastName: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Engineering, Sales"
                    value={profile.department}
                    onChange={(e) => updateProfile({ department: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="major" className="text-sm font-medium">Job Title</Label>
                  <Input
                    id="major"
                    placeholder="e.g. Senior Account Executive"
                    value={profile.major}
                    onChange={(e) => updateProfile({ major: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-sm font-medium">Bio / Working Style</Label>
                <Textarea
                  id="bio"
                  rows={2}
                  placeholder="Tell your team how you work best..."
                  value={profile.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Knowledge Areas</CardTitle>
              <CardDescription>Topics you can help with or want to learn about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a topic (e.g. React, Sales, Data Analysis)"
                  value={knowledgeInput}
                  onChange={(e) => setKnowledgeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKnowledgeArea();
                    }
                  }}
                  className="h-9"
                />
                <Button onClick={() => addKnowledgeArea()} disabled={!knowledgeInput.trim()} size="sm" className="h-9">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Suggestions */}
              {knowledgeInput && filteredSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Suggestions:</span>
                  {filteredSuggestions.map((area) => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => addKnowledgeArea(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Current knowledge areas */}
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-muted/50 rounded-xl">
                {profile.knowledgeAreas.length === 0 ? (
                  <span className="text-sm text-muted-foreground italic">No topics added yet...</span>
                ) : (
                  profile.knowledgeAreas.map((area: string) => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="bg-primary/10 text-primary hover:bg-primary/20 gap-1 pr-1"
                    >
                      {area}
                      <button
                        onClick={() => removeKnowledgeArea(area)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaboration Status</CardTitle>
              <CardDescription>Let teammates know when you're open to helping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground">Looking to Help</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Show a badge on your profile indicating you're open to helping others
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.lookingToHelp}
                  onCheckedChange={handleLookingToHelpChange}
                  className="data-[state=checked]:bg-accent"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Availability</CardTitle>
              <CardDescription>Set when you're available for meetings so teammates can find the best time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Availability Grid - includes timezone and currently available toggle */}
              <AvailabilityGrid
                value={{
                  timezone: profile.timezone,
                  slots: profile.availabilitySlots,
                  currentlyAvailable: profile.currentlyAvailable,
                }}
                onChange={(val) => {
                  updateProfile({
                    timezone: val.timezone,
                    availabilitySlots: val.slots,
                    currentlyAvailable: val.currentlyAvailable,
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Receive meeting invites and updates via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  className="h-9"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive email notifications for nudges and meeting invites
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.emailNotifications}
                  onCheckedChange={(checked) => updateProfile({ emailNotifications: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slack Integration</CardTitle>
              <CardDescription>Receive nudges directly in Slack DMs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.slackConnected ? (
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-foreground">Slack Connected</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.slackHandle
                          ? `Connected as ${profile.slackHandle}`
                          : "You'll receive nudges as direct messages"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectSlack}
                    className="text-destructive hover:text-destructive"
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-foreground">Connect Slack</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get nudges sent directly to your Slack DMs
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={connectSlack}
                    disabled={slackConnecting}
                    className="bg-[#4A154B] hover:bg-[#3a1139] text-white"
                  >
                    {slackConnecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-2" />
                    )}
                    Connect to Slack
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
