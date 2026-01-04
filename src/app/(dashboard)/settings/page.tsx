"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading, CloseMd, CheckBig, User01, Clock, Mail, Link as LinkIcon, LinkBreak, ChatCircle, WifiHigh, WifiOff, Star, AddPlus, Building01, Copy, Camera, Instance, CreditCard01, ArrowRightMd, Download, TrashFull } from "react-coolicons";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AvailabilityGrid, type AvailabilitySlot } from "@/components/availability-grid";
import { usePlanFeatures, getPlanDisplayName, getPlanPricing, type PlanName } from "@/hooks/use-plan-features";
import { useThemeCustomization } from "@/contexts/theme-customization-context";
import { ThemeColorPicker } from "@/components/theme-color-picker";

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
  expertiseText: string;
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
  expertiseText: "",
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

function SettingsContent() {
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
    zoomEmail?: string;
    googleCalendar: boolean;
    googleCalendarEmail?: string;
  }>({ zoom: false, googleCalendar: false });
  const [providersLoading, setProvidersLoading] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialLoad = useRef(true);
  const expertiseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [expertiseSaving, setExpertiseSaving] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // These hooks MUST be called before any early returns
  const { subscription, plan, isOwner: isBillingOwner, loading: billingLoading } = usePlanFeatures();
  const { themeSettings, canCustomize, applyTheme, saveTheme } = useThemeCustomization();

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

    // Handle Zoom OAuth callbacks
    if (successParam === 'zoom_connected') {
      toast.success("Zoom connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadMeetingProviders();
      setActiveTab("integrations");
    }

    // Handle Google Calendar OAuth callbacks
    if (successParam === 'google_connected') {
      toast.success("Google Calendar connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadMeetingProviders();
      setActiveTab("availability");
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

  const disconnectZoom = async () => {
    try {
      const response = await fetch('/api/user/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'zoom' }),
      });
      if (response.ok) {
        setMeetingProviders(prev => ({ ...prev, zoom: false, zoomEmail: undefined }));
        toast.success('Zoom disconnected');
      }
    } catch {
      toast.error('Failed to disconnect Zoom');
    }
  };

  const connectGoogleCalendar = () => {
    window.location.href = '/api/auth/google';
  };

  const disconnectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/user/providers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google_calendar' }),
      });
      if (response.ok) {
        setMeetingProviders(prev => ({ ...prev, googleCalendar: false, googleCalendarEmail: undefined }));
        toast.success('Google Calendar disconnected');
      }
    } catch {
      toast.error('Failed to disconnect Google Calendar');
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
          expertiseText: data.expertise_text || "",
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
    } catch {
      toast.error("Failed to disconnect Slack");
    }
  };

  // Save expertise text (embedding generated on Find Help page)
  const saveExpertise = useCallback(async (text: string) => {
    if (expertiseTimeoutRef.current) {
      clearTimeout(expertiseTimeoutRef.current);
    }

    expertiseTimeoutRef.current = setTimeout(async () => {
      setExpertiseSaving(true);
      try {
        const response = await fetch('/api/profile/expertise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expertiseText: text, embedding: null }),
        });

        if (!response.ok) {
          throw new Error('Failed to save');
        }
      } catch (error) {
        console.error('Failed to save expertise:', error);
        toast.error('Failed to save expertise');
      } finally {
        setExpertiseSaving(false);
      }
    }, 1000);
  }, []);

  // Handle expertise text changes
  const handleExpertiseChange = (text: string) => {
    updateProfile({ expertiseText: text });
    saveExpertise(text);
  };

  // Export user data (GDPR)
  const handleExportData = async () => {
    setExportingData(true);
    try {
      const response = await fetch('/api/user/export');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export data');
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attunly-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Data export downloaded');
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || 'Failed to export data');
    } finally {
      setExportingData(false);
    }
  };

  // Delete account (GDPR)
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeletingAccount(true);
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE_MY_ACCOUNT' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      // Redirect to home page after deletion
      window.location.href = '/';
    } catch (error: any) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  const filteredSuggestions = SUGGESTED_KNOWLEDGE_AREAS.filter(
    area => !profile.knowledgeAreas.includes(area) && area.toLowerCase().includes(knowledgeInput.toLowerCase())
  ).slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loading className="w-6 h-6 animate-spin text-primary" />
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

  const baseTabs = [
    { id: "profile", label: "Profile", icon: User01 },
    { id: "availability", label: "Availability", icon: Clock },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "organization", label: "Organization", icon: Building01 },
  ];

  // Add billing tab only for org owners
  const tabs = org?.isOwner
    ? [...baseTabs, { id: "billing", label: "Billing", icon: CreditCard01 }]
    : baseTabs;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {saveStatus === 'saving' && <><Loading className="h-4 w-4 animate-spin" /> Saving...</>}
          {saveStatus === 'saved' && <><CheckBig className="h-4 w-4 text-success" /> Saved</>}
          {saveStatus === 'error' && <><WifiOff className="h-4 w-4 text-destructive" /> Error</>}
          {saveStatus === 'idle' && <><WifiHigh className="h-4 w-4" /> Auto-save</>}
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

          {/* What Can You Help With - AI-powered expertise matching */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">What can you help with?</CardTitle>
                {expertiseSaving && (
                  <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                    <Loading className="w-3 h-3 animate-spin mr-1" />
                    Saving...
                  </Badge>
                )}
              </div>
              <CardDescription>
                Describe your expertise in your own words. Be specific about tools, processes, or domains you know well.
                Our AI will match you with teammates who need your help.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={profile.expertiseText}
                onChange={(e) => handleExpertiseChange(e.target.value)}
                placeholder="Example: I've been doing sales ops for 5 years. Really good at Salesforce automation, building reports, and helping new reps get up to speed. Also know SQL for custom reporting."
                rows={4}
                maxLength={500}
                className="resize-none"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{profile.expertiseText?.length || 0}/500 characters</span>
                {profile.expertiseText && !expertiseSaving && (
                  <span className="flex items-center gap-1 text-success">
                    <CheckBig className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data - GDPR Compliance */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Privacy & Data</CardTitle>
              <CardDescription>Manage your personal data and account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export Data */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Export Your Data</p>
                    <p className="text-sm text-muted-foreground">Download all your personal data as JSON</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  disabled={exportingData}
                >
                  {exportingData ? (
                    <>
                      <Loading className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              </div>

              {/* Delete Account */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center">
                      <TrashFull className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Delete Account</p>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <TrashFull className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
                  >
                    <p className="text-sm font-medium text-destructive mb-2">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE"
                        className="max-w-[200px]"
                      />
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
                      >
                        {deletingAccount ? (
                          <>
                            <Loading className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Confirm Delete'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Availability Tab */}
      {activeTab === "availability" && (
        <div className="space-y-6">
          {/* Google Calendar Sync */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-6 h-6">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Google Calendar</CardTitle>
                  <CardDescription>Sync your calendar to show when you're busy</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {meetingProviders.googleCalendar ? (
                <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                      <CheckBig className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Calendar Connected</p>
                      <p className="text-sm text-muted-foreground">
                        {meetingProviders.googleCalendarEmail || "Syncing busy times"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectGoogleCalendar}
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <LinkBreak className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border/50">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Connect Google Calendar</p>
                      <p className="text-sm text-muted-foreground">Auto-sync busy times from your calendar</p>
                    </div>
                  </div>
                  <Button onClick={connectGoogleCalendar} className="bg-[#4285F4] hover:bg-[#3367D6] gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Connect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Availability Grid */}
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
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
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
              <div className="flex items-center gap-3">
                <img src="/slack-icon.svg" alt="Slack" className="w-6 h-6" />
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
                    <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
                      <CheckBig className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {profile.slackHandle ? `@${profile.slackHandle}` : "Connected"}
                      </p>
                      <p className="text-sm text-muted-foreground">Receiving direct messages</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={disconnectSlack} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
                    <LinkBreak className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border/50">
                      <img src="/slack-icon.svg" alt="Slack" className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Connect Slack</p>
                      <p className="text-sm text-muted-foreground">Get nudges as direct messages</p>
                    </div>
                  </div>
                  <Button onClick={connectSlack} disabled={slackConnecting} className="bg-[#4A154B] hover:bg-[#611f69] gap-2">
                    {slackConnecting ? (
                      <Loading className="w-4 h-4 animate-spin" />
                    ) : (
                      <img src="/slack-icon.svg" alt="" className="w-4 h-4" />
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
                <img src="/zoom-icon.svg" alt="Video" className="w-6 h-6" />
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
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src="/zoom-icon.svg" alt="Zoom" className="w-10 h-10" />
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
                    onClick={disconnectZoom}
                    className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <LinkBreak className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src="/zoom-icon.svg" alt="Zoom" className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Zoom</p>
                      <p className="text-sm text-muted-foreground">Create Zoom meetings automatically</p>
                    </div>
                  </div>
                  <Button onClick={connectZoom} className="bg-[#2D8CFF] hover:bg-[#2681F2] gap-2">
                    <img src="/zoom-icon.svg" alt="" className="w-4 h-4" />
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
                      <Building01 className="w-6 h-6 text-primary" />
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
                          <CheckBig className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
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
                          <CheckBig className="w-5 h-5 text-success" />
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
                          <ChatCircle className="w-5 h-5 text-[#4A154B]" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Connect Workspace Slack</p>
                          <p className="text-sm text-muted-foreground">Enable Slack notifications for your team</p>
                        </div>
                      </div>
                      {org.isOwner && (
                        <Button className="bg-[#4A154B] hover:bg-[#611f69]">
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Theme Customization - Pro+ feature */}
              {org.isOwner && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-semibold">Brand Colors</CardTitle>
                        <CardDescription>Customize your team's color theme</CardDescription>
                      </div>
                      {!canCustomize && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          Pro
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ThemeColorPicker
                      currentSettings={themeSettings}
                      onPreview={applyTheme}
                      onSave={saveTheme}
                      disabled={!canCustomize}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Leave Organization - For non-owners */}
              {!org.isOwner && (
                <Card className="border-destructive/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold">Leave Organization</CardTitle>
                    <CardDescription>Remove yourself from {org.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        You'll lose access to all pods and data in this organization.
                      </p>
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={async () => {
                          if (!confirm('Are you sure you want to leave this organization? This cannot be undone.')) return;
                          try {
                            const { error } = await supabase
                              .from('profiles')
                              .update({ organization_id: null })
                              .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
                            if (error) throw error;
                            toast.success('Left organization');
                            window.location.href = '/org-setup';
                          } catch (err) {
                            toast.error('Failed to leave organization');
                          }
                        }}
                      >
                        Leave Organization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Delete Organization - For owners */}
              {org.isOwner && (
                <Card className="border-destructive/30">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for {org.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                      <div>
                        <p className="font-medium text-foreground">Delete Organization</p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete this organization and all its data
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={async () => {
                          const confirmText = prompt(
                            `This will permanently delete "${org.name}" and all its pods, members data, and settings.\n\nType the organization name to confirm:`
                          );
                          if (confirmText !== org.name) {
                            if (confirmText !== null) {
                              toast.error('Organization name did not match');
                            }
                            return;
                          }
                          try {
                            // First remove all members from org
                            const { error: memberError } = await supabase
                              .from('profiles')
                              .update({ organization_id: null })
                              .eq('organization_id', org.id);
                            if (memberError) throw memberError;

                            // Then delete the organization
                            const { error: orgError } = await supabase
                              .from('organizations')
                              .delete()
                              .eq('id', org.id);
                            if (orgError) throw orgError;

                            toast.success('Organization deleted');
                            window.location.href = '/org-setup';
                          } catch (err) {
                            console.error('Delete org error:', err);
                            toast.error('Failed to delete organization');
                          }
                        }}
                      >
                        <TrashFull className="w-4 h-4 mr-2" />
                        Delete Organization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building01 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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

      {/* Billing Tab - Only for org owners */}
      {activeTab === "billing" && org?.isOwner && (
        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Current Plan</CardTitle>
                  <CardDescription>Manage your organization's subscription</CardDescription>
                </div>
                {subscription?.hasActiveSubscription && (
                  <Badge variant="secondary" className="bg-success/10 text-success border-0">
                    <CheckBig className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    {plan === 'free' ? (
                      <Building01 className="w-6 h-6 text-primary" />
                    ) : (
                      <Star className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{getPlanDisplayName(plan)} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {plan === 'free' ? (
                        'Free forever with basic features'
                      ) : (
                        <>
                          {subscription?.seats || 1} seat{(subscription?.seats || 1) > 1 ? 's' : ''} &middot;{' '}
                          {subscription?.periodEnd
                            ? `Renews ${new Date(subscription.periodEnd).toLocaleDateString()}`
                            : 'Active subscription'}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {subscription?.hasActiveSubscription && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/billing/portal', { method: 'POST' });
                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch {
                        toast.error('Failed to open billing portal');
                      }
                    }}
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>

              {/* Subscription status warnings */}
              {subscription?.status === 'past_due' && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <p className="text-sm text-destructive font-medium">
                    Payment past due - please update your payment method to avoid service interruption.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Options - Show if on free plan */}
          {plan === 'free' && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Upgrade Your Plan</CardTitle>
                <CardDescription>Unlock more features for your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Starter Plan */}
                  <div className="p-4 border rounded-xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">Starter</h3>
                      <p className="text-sm text-muted-foreground">
                        ${getPlanPricing('starter').monthly}/seat/mo
                      </p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Up to 20 seats</li>
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Up to 10 pods</li>
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Advanced analytics</li>
                    </ul>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/billing/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: 'starter', billingPeriod: 'monthly', seats: 5 }),
                          });
                          const data = await response.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            toast.error(data.error || 'Failed to start checkout');
                          }
                        } catch {
                          toast.error('Failed to start checkout');
                        }
                      }}
                    >
                      Upgrade to Starter
                      <ArrowRightMd className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Pro Plan */}
                  <div className="p-4 border-2 border-primary rounded-xl bg-primary/10 relative">
                    <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">Pro</h3>
                      <p className="text-sm text-muted-foreground">
                        ${getPlanPricing('pro').monthly}/seat/mo
                      </p>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Up to 100 seats</li>
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Up to 50 pods</li>
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Custom branding</li>
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />Priority support</li>
                      <li className="flex items-center gap-2"><CheckBig className="w-4 h-4 text-success shrink-0" />API access</li>
                    </ul>
                    <Button
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/billing/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ plan: 'pro', billingPeriod: 'monthly', seats: 5 }),
                          });
                          const data = await response.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            toast.error(data.error || 'Failed to start checkout');
                          }
                        } catch {
                          toast.error('Failed to start checkout');
                        }
                      }}
                    >
                      Upgrade to Pro
                      <ArrowRightMd className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Need more? <a href="mailto:support@attunly.com" className="text-primary hover:underline">Contact us</a> for Enterprise pricing.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Usage Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Usage Overview</CardTitle>
              <CardDescription>Your current usage vs plan limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seats Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User01 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Team Seats</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {subscription?.seats || 1} / {plan === 'enterprise' ? '∞' : plan === 'free' ? 5 : plan === 'starter' ? 20 : 100}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(((subscription?.seats || 1) / (plan === 'free' ? 5 : plan === 'starter' ? 20 : 100)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Pods Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building01 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Active Pods</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    - / {plan === 'enterprise' ? '∞' : plan === 'free' ? 2 : plan === 'starter' ? 10 : 50}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}

// Settings page wrapper with Suspense for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
