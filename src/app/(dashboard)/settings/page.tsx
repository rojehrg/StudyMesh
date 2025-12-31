"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X, Check, User, Clock, Mail, Link2, Unlink, MessageCircle, Cloud, CloudOff, Sparkles, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AvailabilityGrid, type AvailabilitySlot } from "@/components/availability-grid";

const SUGGESTED_KNOWLEDGE_AREAS = [
  "JavaScript", "TypeScript", "Python", "React", "Node.js", "SQL", "AWS",
  "Product Management", "Design", "Sales", "Marketing", "Data Analysis",
  "Machine Learning", "DevOps", "Customer Success", "Finance", "HR",
  "Copywriting", "SEO", "Growth", "Operations", "Legal", "Security",
];

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
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [knowledgeInput, setKnowledgeInput] = useState("");
  const [slackConnecting, setSlackConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialLoad = useRef(true);

  const supabase = createClient();

  useEffect(() => {
    const slackStatus = searchParams.get('slack');
    if (slackStatus === 'success') {
      toast.success("Slack connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadProfile();
    } else if (slackStatus === 'cancelled') {
      toast.info("Slack connection cancelled");
      window.history.replaceState({}, '', '/settings');
    } else if (slackStatus === 'error') {
      const message = searchParams.get('message') || 'Unknown error';
      toast.error("Failed to connect Slack", { description: message });
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
      toast.error("Failed to save");
    }
  }, [supabase]);

  useEffect(() => {
    if (loading || isInitialLoad.current) return;
    const currentData = JSON.stringify(profile);
    if (currentData === lastSavedRef.current) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveProfile(profile), 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [profile, loading, saveProfile]);

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addKnowledgeArea = (area?: string) => {
    const areaToAdd = area || knowledgeInput.trim();
    if (!areaToAdd || profile.knowledgeAreas.includes(areaToAdd)) return;
    updateProfile({ knowledgeAreas: [...profile.knowledgeAreas, areaToAdd] });
    setKnowledgeInput("");
  };

  const removeKnowledgeArea = (area: string) => {
    updateProfile({ knowledgeAreas: profile.knowledgeAreas.filter(a => a !== area) });
  };

  const connectSlack = () => {
    setSlackConnecting(true);
    window.location.href = '/api/slack/oauth';
  };

  const disconnectSlack = async () => {
    try {
      const response = await fetch('/api/slack/oauth', { method: 'POST' });
      if (response.ok) {
        updateProfile({ slackConnected: false, slackUserId: "", slackHandle: "" });
        toast.success("Slack disconnected");
      }
    } catch (error) {
      toast.error("Failed to disconnect Slack");
    }
  };

  const filteredSuggestions = SUGGESTED_KNOWLEDGE_AREAS.filter(
    area => !profile.knowledgeAreas.includes(area) && area.toLowerCase().includes(knowledgeInput.toLowerCase())
  ).slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "availability", label: "Availability", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Mail },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>}
          {saveStatus === 'saved' && <><Check className="h-4 w-4 text-success" /> Saved</>}
          {saveStatus === 'error' && <><CloudOff className="h-4 w-4 text-destructive" /> Error</>}
          {saveStatus === 'idle' && <><Cloud className="h-4 w-4" /> Auto-save</>}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Basic Information</CardTitle>
              <CardDescription>Your personal details visible to teammates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">First Name</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => updateProfile({ firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Last Name</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => updateProfile({ lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Department</Label>
                  <Input
                    value={profile.department}
                    onChange={(e) => updateProfile({ department: e.target.value })}
                    placeholder="Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Job Title</Label>
                  <Input
                    value={profile.major}
                    onChange={(e) => updateProfile({ major: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Bio</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => updateProfile({ bio: e.target.value })}
                  placeholder="Tell your team about yourself..."
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Areas */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Knowledge Areas</CardTitle>
              <CardDescription>Skills you can help teammates with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={knowledgeInput}
                  onChange={(e) => setKnowledgeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKnowledgeArea())}
                  placeholder="Add a skill..."
                  className="flex-1"
                />
                <Button
                  onClick={() => addKnowledgeArea()}
                  disabled={!knowledgeInput.trim()}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {knowledgeInput && filteredSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filteredSuggestions.map(area => (
                    <button
                      key={area}
                      onClick={() => addKnowledgeArea(area)}
                      className="px-2.5 py-1 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-md transition-colors"
                    >
                      {area}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                {profile.knowledgeAreas.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No skills added yet</span>
                ) : (
                  profile.knowledgeAreas.map(area => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-0 gap-1"
                    >
                      {area}
                      <button onClick={() => removeKnowledgeArea(area)} className="hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Looking to Help</p>
                    <p className="text-sm text-muted-foreground">Show others you're available to assist</p>
                  </div>
                </div>
                <Switch
                  checked={profile.lookingToHelp}
                  onCheckedChange={(checked) => {
                    updateProfile({ lookingToHelp: checked });
                    toast.success(checked ? "Status updated" : "Status removed");
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Availability Tab */}
      {activeTab === "availability" && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Weekly Availability</CardTitle>
            <CardDescription>Set when you're free to help teammates</CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilityGrid
              value={{
                timezone: profile.timezone,
                slots: profile.availabilitySlots,
                currentlyAvailable: profile.currentlyAvailable,
              }}
              onChange={(val) => updateProfile({
                timezone: val.timezone,
                availabilitySlots: val.slots,
                currentlyAvailable: val.currentlyAvailable,
              })}
            />
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Email */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Email Notifications</CardTitle>
              <CardDescription>How you receive updates via email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Email Address</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  placeholder="you@company.com"
                  className="max-w-md"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive nudges and meeting invites</p>
                  </div>
                </div>
                <Switch
                  checked={profile.emailNotifications}
                  onCheckedChange={(checked) => updateProfile({ emailNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Slack */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Slack Integration</CardTitle>
              <CardDescription>Get notified directly in Slack</CardDescription>
            </CardHeader>
            <CardContent>
              {profile.slackConnected ? (
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.slackHandle ? `@${profile.slackHandle}` : "Receiving DMs"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectSlack} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#4A154B]/10 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-[#4A154B]" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Connect Slack</p>
                      <p className="text-sm text-muted-foreground">Get nudges as direct messages</p>
                    </div>
                  </div>
                  <Button onClick={connectSlack} disabled={slackConnecting} className="bg-[#4A154B] hover:bg-[#611f69]">
                    {slackConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4 mr-2" />}
                    Connect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
