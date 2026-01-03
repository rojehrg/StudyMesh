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
import { CircleNotch, X, Check, User, Clock, Envelope, Link, LinkBreak, ChatCircle, Cloud, CloudSlash, Sparkle, Plus, Buildings, Copy, VideoCamera, Plugs } from "@phosphor-icons/react";
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

interface OrgData {
  id: string;
  name: string;
  inviteCode: string;
  isOwner: boolean;
  slackConnected: boolean;
  slackTeamName: string;
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
  const [org, setOrg] = useState<OrgData | null>(null);
  const [knowledgeInput, setKnowledgeInput] = useState("");
  const [slackConnecting, setSlackConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [meetingProviders, setMeetingProviders] = useState<{
    zoom: boolean;
    google: boolean;
    zoomEmail?: string;
    googleEmail?: string;
  }>({ zoom: false, google: false });
  const [providersLoading, setProvidersLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialLoad = useRef(true);

  const supabase = createClient();

  useEffect(() => {
    // Handle OAuth callbacks
    const slackStatus = searchParams.get('slack');
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');

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

    // Handle Zoom/Google OAuth callbacks
    if (successParam === 'zoom_connected') {
      toast.success("Zoom connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadMeetingProviders();
      setActiveTab("notifications");
    } else if (successParam === 'google_connected') {
      toast.success("Google Meet connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadMeetingProviders();
      setActiveTab("notifications");
    }

    if (errorParam) {
      const errorMessages: Record<string, string> = {
        'zoom_denied': 'Zoom authorization was denied',
        'zoom_invalid_response': 'Invalid response from Zoom',
        'zoom_token_exchange_failed': 'Failed to connect Zoom account',
        'zoom_callback_failed': 'Zoom connection failed',
        'google_denied': 'Google authorization was denied',
        'google_invalid_response': 'Invalid response from Google',
        'google_token_exchange_failed': 'Failed to connect Google account',
        'google_callback_failed': 'Google connection failed',
      };
      toast.error(errorMessages[errorParam] || 'Connection failed');
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams]);

  useEffect(() => {
    loadProfile();
    loadMeetingProviders();
  }, []);

  const loadMeetingProviders = async () => {
    setProvidersLoading(true);
    try {
      const response = await fetch('/api/user/providers');
      const data = await response.json();
      if (data.success) {
        setMeetingProviders(data.providers);
      }
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setProvidersLoading(false);
    }
  };

  const connectZoom = () => {
    window.location.href = '/api/auth/zoom';
  };

  const connectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const disconnectProvider = async (provider: 'zoom' | 'google') => {
    try {
      const response = await fetch('/api/user/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (response.ok) {
        setMeetingProviders(prev => ({
          ...prev,
          [provider]: false,
          [`${provider}Email`]: undefined,
        }));
        toast.success(`${provider === 'zoom' ? 'Zoom' : 'Google'} disconnected`);
      }
    } catch (error) {
      toast.error(`Failed to disconnect ${provider === 'zoom' ? 'Zoom' : 'Google'}`);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
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

        // Load organization data
        if (data.organizations) {
          setOrg({
            id: data.organizations.id,
            name: data.organizations.name,
            inviteCode: data.organizations.invite_code || "",
            isOwner: data.organizations.owner_id === user.id,
            slackConnected: !!data.organizations.slack_team_id,
            slackTeamName: data.organizations.slack_team_name || "",
          });
        }
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
        <CircleNotch className="w-6 h-6 animate-spin text-primary" weight="duotone" />
      </div>
    );
  }

  const copyInviteCode = () => {
    if (org?.inviteCode) {
      navigator.clipboard.writeText(org.inviteCode);
      setCopiedInvite(true);
      toast.success("Invite code copied!");
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "availability", label: "Availability", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Envelope },
    { id: "organization", label: "Organization", icon: Buildings },
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
          {saveStatus === 'saving' && <><CircleNotch className="h-4 w-4 animate-spin" weight="duotone" /> Saving...</>}
          {saveStatus === 'saved' && <><Check className="h-4 w-4 text-success" weight="duotone" /> Saved</>}
          {saveStatus === 'error' && <><CloudSlash className="h-4 w-4 text-destructive" weight="duotone" /> Error</>}
          {saveStatus === 'idle' && <><Cloud className="h-4 w-4" weight="duotone" /> Auto-save</>}
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
            <tab.icon className="w-4 h-4" weight="duotone" />
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
                  <Plus className="w-4 h-4" weight="duotone" />
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
                        <X className="w-3 h-3" weight="duotone" />
                      </button>
                    </Badge>
                  ))
                )}
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
                    <Envelope className="w-5 h-5 text-primary" weight="duotone" />
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
              <div className="flex items-center gap-3">
                <img src="/slack-logo.png" alt="Slack" className="w-6 h-6" />
                <div>
                  <CardTitle className="text-base font-semibold">Slack Integration</CardTitle>
                  <CardDescription>Get notified directly in Slack</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profile.slackConnected ? (
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50">
                      <img src="/slack-logo.png" alt="Slack" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.slackHandle ? `@${profile.slackHandle}` : "Receiving DMs"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectSlack} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
                    <LinkBreak className="w-4 h-4 mr-2" weight="duotone" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-border/50">
                      <img src="/slack-logo.png" alt="Slack" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Connect Slack</p>
                      <p className="text-sm text-muted-foreground">Get nudges as direct messages</p>
                    </div>
                  </div>
                  <Button onClick={connectSlack} disabled={slackConnecting} className="bg-[#4A154B] hover:bg-[#611f69] gap-2">
                    {slackConnecting ? (
                      <CircleNotch className="w-4 h-4 animate-spin" weight="duotone" />
                    ) : (
                      <img src="/slack-logo.png" alt="" className="w-4 h-4" />
                    )}
                    Connect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Conferencing */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <VideoCamera className="w-6 h-6 text-primary" weight="duotone" />
                <div>
                  <CardTitle className="text-base font-semibold">Video Conferencing</CardTitle>
                  <CardDescription>Auto-generate meeting links when scheduling</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Zoom */}
              {meetingProviders.zoom ? (
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <VideoCamera className="w-5 h-5 text-white" weight="fill" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Zoom Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {meetingProviders.zoomEmail || "Ready to create meetings"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectProvider('zoom')}
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <LinkBreak className="w-4 h-4 mr-2" weight="duotone" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <VideoCamera className="w-5 h-5 text-blue-500" weight="duotone" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Zoom</p>
                      <p className="text-sm text-muted-foreground">Create Zoom meetings automatically</p>
                    </div>
                  </div>
                  <Button onClick={connectZoom} className="bg-blue-500 hover:bg-blue-600 gap-2">
                    <Plugs className="w-4 h-4" weight="duotone" />
                    Connect
                  </Button>
                </div>
              )}

              {/* Google Meet */}
              {meetingProviders.google ? (
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <VideoCamera className="w-5 h-5 text-white" weight="fill" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Google Meet Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {meetingProviders.googleEmail || "Ready to create meetings"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => disconnectProvider('google')}
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <LinkBreak className="w-4 h-4 mr-2" weight="duotone" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <VideoCamera className="w-5 h-5 text-green-500" weight="duotone" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Google Meet</p>
                      <p className="text-sm text-muted-foreground">Create Google Meet links automatically</p>
                    </div>
                  </div>
                  <Button onClick={connectGoogle} className="bg-green-500 hover:bg-green-600 gap-2">
                    <Plugs className="w-4 h-4" weight="duotone" />
                    Connect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Organization Tab */}
      {activeTab === "organization" && (
        <div className="space-y-6">
          {org ? (
            <>
              {/* Org Info */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Organization</CardTitle>
                  <CardDescription>Your team workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Buildings className="w-6 h-6 text-primary" weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {org.isOwner ? "Owner" : "Member"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invite Code */}
              {org.isOwner && org.inviteCode && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">Invite Code</CardTitle>
                    <CardDescription>Share this code to invite teammates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg tracking-widest text-center">
                        {org.inviteCode}
                      </div>
                      <Button onClick={copyInviteCode} variant="outline" size="icon">
                        {copiedInvite ? (
                          <Check className="w-4 h-4 text-success" weight="duotone" />
                        ) : (
                          <Copy className="w-4 h-4" weight="duotone" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Org Slack Integration */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">Workspace Slack</CardTitle>
                  <CardDescription>Connect your organization's Slack workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  {org.slackConnected ? (
                    <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                          <Check className="w-5 h-5 text-success" weight="duotone" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Connected</p>
                          <p className="text-sm text-muted-foreground">
                            {org.slackTeamName || "Workspace connected"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#4A154B]/10 rounded-xl flex items-center justify-center">
                          <ChatCircle className="w-5 h-5 text-[#4A154B]" weight="duotone" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Connect Workspace Slack</p>
                          <p className="text-sm text-muted-foreground">Enable Slack notifications for your team</p>
                        </div>
                      </div>
                      {org.isOwner && (
                        <Button className="bg-[#4A154B] hover:bg-[#611f69]">
                          <Link className="w-4 h-4 mr-2" weight="duotone" />
                          Connect
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Buildings className="w-12 h-12 text-muted-foreground mx-auto mb-4" weight="duotone" />
                <h3 className="font-semibold text-foreground mb-2">No Organization</h3>
                <p className="text-sm text-muted-foreground mb-4">You're not part of an organization yet</p>
                <Button asChild>
                  <a href="/org-setup">Join or Create Organization</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </motion.div>
  );
}
