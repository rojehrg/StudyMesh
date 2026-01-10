"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckBig, LinkBreak, WifiHigh, WifiOff, Building01, Copy, CreditCard01, ArrowRightMd, Download, TrashFull } from "react-coolicons";
import { LottieLoader, PageLoader } from "@/components/loading-states";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { usePlanFeatures, getPlanDisplayName, getPlanPricing } from "@/hooks/use-plan-features";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProfileData {
  firstName: string;
  lastName: string;
  department: string;
  major: string;
  expertiseText: string;
  slackHandle: string;
  slackConnected: boolean;
  avatarUrl: string | null;
}

interface OrgData {
  id: string;
  name: string;
  inviteCode: string;
  isOwner: boolean;
  slackConnected: boolean;
  slackTeamName: string;
  memberCount?: number;
  slackConnectedCount?: number;
  expertiseFilledCount?: number;
}

const DEFAULT_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  department: "",
  major: "",
  expertiseText: "",
  slackHandle: "",
  slackConnected: false,
  avatarUrl: null,
};

function SettingsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [org, setOrg] = useState<OrgData | null>(null);
  const [slackConnecting, setSlackConnecting] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [meetingProviders, setMeetingProviders] = useState<{
    zoom: boolean;
    zoomEmail?: string;
    googleCalendar: boolean;
    googleCalendarEmail?: string;
  }>({ zoom: false, googleCalendar: false });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isInitialLoad = useRef(true);
  const expertiseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [expertiseSaving, setExpertiseSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { subscription, plan, loading: billingLoading } = usePlanFeatures();
  const supabase = createClient();

  // Handle OAuth callbacks
  useEffect(() => {
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
      toast.error("Failed to connect Slack");
      window.history.replaceState({}, '', '/settings');
    }

    if (successParam === 'zoom_connected') {
      toast.success("Zoom connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadMeetingProviders();
    }

    if (successParam === 'google_connected') {
      toast.success("Google Calendar connected successfully!");
      window.history.replaceState({}, '', '/settings');
      loadMeetingProviders();
    }

    if (errorParam) {
      toast.error('Connection failed');
      window.history.replaceState({}, '', '/settings');
    }
  }, [searchParams]);

  useEffect(() => {
    loadProfile();
    loadMeetingProviders();
  }, []);

  const loadMeetingProviders = async () => {
    try {
      const response = await fetch('/api/user/providers');
      const data = await response.json();
      if (data.success) {
        setMeetingProviders(data.providers);
      }
    } catch (error) {
      console.error("Error loading providers:", error);
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          department: profileData.department || "",
          major: profileData.major || "",
          expertiseText: profileData.expertise_text || "",
          slackHandle: profileData.slack_handle || "",
          slackConnected: profileData.slack_connected || false,
          avatarUrl: profileData.avatar_url || null,
        });
        lastSavedRef.current = JSON.stringify(profileData);
      }

      // Load org data directly from profile's organization_id
      if (profileData?.organization_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, invite_code, slack_bot_token, slack_team_name, owner_id')
          .eq('id', profileData.organization_id)
          .single();

        if (orgData) {
          const isOwner = orgData.owner_id === user.id;
          const slackConnected = !!orgData.slack_bot_token;

          // Get member stats for admins/owners
          let memberCount = 0;
          let slackConnectedCount = 0;
          let expertiseFilledCount = 0;

          if (isOwner) {
            // Get profiles with slack connected in this org
            const { data: profiles } = await supabase
              .from('profiles')
              .select('slack_connected, expertise_text')
              .eq('organization_id', orgData.id);

            if (profiles) {
              memberCount = profiles.length;
              slackConnectedCount = profiles.filter(p => p.slack_connected).length;
              expertiseFilledCount = profiles.filter(p => p.expertise_text && p.expertise_text.length > 10).length;
            }
          }

          setOrg({
            id: orgData.id,
            name: orgData.name,
            inviteCode: orgData.invite_code,
            isOwner,
            slackConnected,
            slackTeamName: orgData.slack_team_name || "",
            memberCount,
            slackConnectedCount,
            expertiseFilledCount,
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

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: profile.firstName,
            last_name: profile.lastName,
            department: profile.department,
            major: profile.major,
            ...updates.firstName !== undefined && { first_name: updates.firstName },
            ...updates.lastName !== undefined && { last_name: updates.lastName },
            ...updates.department !== undefined && { department: updates.department },
            ...updates.major !== undefined && { major: updates.major },
          })
          .eq('user_id', user.id);

        if (error) throw error;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  };

  const handleExpertiseChange = (text: string) => {
    setProfile(prev => ({ ...prev, expertiseText: text }));

    if (expertiseTimeoutRef.current) {
      clearTimeout(expertiseTimeoutRef.current);
    }

    setExpertiseSaving(true);
    expertiseTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update({ expertise_text: text })
          .eq('user_id', user.id);

        if (error) throw error;
        setExpertiseSaving(false);
      } catch {
        setExpertiseSaving(false);
        toast.error('Failed to save expertise');
      }
    }, 1500);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Use JPG, PNG, or WebP.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 2MB.');
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
        toast.success('Profile photo updated');
      } else {
        toast.error(data.error || 'Failed to upload photo');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setAvatarUploading(false);
      // Reset input so same file can be selected again
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarUploading(true);
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setProfile(prev => ({ ...prev, avatarUrl: null }));
        toast.success('Profile photo removed');
      } else {
        toast.error(data.error || 'Failed to remove photo');
      }
    } catch {
      toast.error('Failed to remove photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  const connectSlack = () => {
    setSlackConnecting(true);
    window.location.href = '/api/slack/oauth';
  };

  const disconnectSlack = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ slack_connected: false, slack_user_id: null, slack_handle: null })
        .eq('user_id', user.id);

      if (error) throw error;
      setProfile(prev => ({ ...prev, slackConnected: false, slackHandle: "" }));
      toast.success('Slack disconnected');
    } catch {
      toast.error('Failed to disconnect Slack');
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
        body: JSON.stringify({ provider: 'google' }),
      });
      if (response.ok) {
        setMeetingProviders(prev => ({ ...prev, googleCalendar: false, googleCalendarEmail: undefined }));
        toast.success('Google Calendar disconnected');
      }
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const copyInviteCode = () => {
    if (org?.inviteCode) {
      navigator.clipboard.writeText(org.inviteCode);
      setCopiedInvite(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    setDeletingAccount(true);
    try {
      const response = await fetch('/api/user/delete', { method: 'DELETE' });
      if (response.ok) {
        toast.success('Account deleted');
        window.location.href = '/';
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-espresso">Settings</h1>
          <p className="text-coffee-cortado mt-1">Manage your profile and integrations</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-coffee-cortado">
          {saveStatus === 'saving' && <><LottieLoader size="sm" className="w-4 h-4" /> Saving...</>}
          {saveStatus === 'saved' && <><CheckBig className="h-4 w-4 text-emerald-600" /> Saved</>}
          {saveStatus === 'error' && <><WifiOff className="h-4 w-4 text-red-500" /> Error</>}
          {saveStatus === 'idle' && <><WifiHigh className="h-4 w-4" /> Auto-save</>}
        </div>
      </div>

      {/* Profile Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Your Profile</h2>

        <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 pb-4 border-b border-coffee-foam">
            <div className="relative">
              <Avatar className="h-20 w-20 ring-2 ring-coffee-foam">
                {profile.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt="Profile photo" />
                ) : null}
                <AvatarFallback className="bg-coffee-cream text-coffee-mocha text-xl font-semibold">
                  {profile.firstName?.[0]?.toUpperCase() || profile.lastName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              {avatarUploading && (
                <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                  <LottieLoader size="sm" className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-coffee-espresso mb-1">Profile Photo</p>
              <p className="text-sm text-coffee-mocha mb-3">JPG, PNG, or WebP. Max 2MB.</p>
              <div className="flex items-center gap-2">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  aria-label="Upload profile photo"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                >
                  <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                  {profile.avatarUrl ? 'Change' : 'Upload'}
                </Button>
                {profile.avatarUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAvatarRemove}
                    disabled={avatarUploading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" aria-hidden="true" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm text-coffee-mocha">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName}
                onChange={(e) => updateProfile({ firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm text-coffee-mocha">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName}
                onChange={(e) => updateProfile({ lastName: e.target.value })}
                placeholder="Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm text-coffee-mocha">Department</Label>
              <Input
                id="department"
                value={profile.department}
                onChange={(e) => updateProfile({ department: e.target.value })}
                placeholder="Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-sm text-coffee-mocha">Job Title</Label>
              <Input
                id="jobTitle"
                value={profile.major}
                onChange={(e) => updateProfile({ major: e.target.value })}
                placeholder="Software Engineer"
              />
            </div>
          </div>
        </div>

        {/* Expertise */}
        <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="expertise" className="font-medium text-coffee-espresso block">What can you help with?</Label>
              <p id="expertise-description" className="text-sm text-coffee-mocha mt-1">Describe your expertise - our AI uses this to match you with teammates who need help.</p>
            </div>
            {expertiseSaving && (
              <Badge className="bg-coffee-cream text-coffee-mocha text-xs" aria-live="polite">
                <LottieLoader size="sm" className="w-3 h-3 mr-1" aria-hidden="true" />
                Saving...
              </Badge>
            )}
          </div>
          <Textarea
            id="expertise"
            aria-describedby="expertise-description"
            value={profile.expertiseText}
            onChange={(e) => handleExpertiseChange(e.target.value)}
            placeholder="Example: I've been doing sales ops for 5 years. Really good at Salesforce automation, building reports, and helping new reps get up to speed."
            rows={3}
            maxLength={500}
            className="resize-none"
          />
          <div className="flex items-center justify-between text-xs text-coffee-cortado">
            <span>{profile.expertiseText?.length || 0}/500 characters</span>
            {profile.expertiseText && !expertiseSaving && (
              <span className="flex items-center gap-1 text-emerald-600">
                <CheckBig className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Integrations</h2>

        {/* Slack */}
        <div className="bg-white rounded-xl border border-coffee-foam p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/slack-icon.svg" alt="Slack" width={40} height={40} />
              <div>
                <p className="font-medium text-coffee-espresso">Slack</p>
                <p className="text-sm text-coffee-cortado">
                  {profile.slackConnected
                    ? `@${profile.slackHandle || 'connected'}`
                    : "Required for /attunly command"
                  }
                </p>
              </div>
            </div>
            {profile.slackConnected ? (
              <Button variant="outline" size="sm" onClick={disconnectSlack} className="text-red-500 hover:text-red-500 border-red-200 hover:bg-red-50">
                <LinkBreak className="w-4 h-4 mr-2" aria-hidden="true" />
                Disconnect Slack
              </Button>
            ) : (
              <Button onClick={connectSlack} disabled={slackConnecting} className="bg-[#4A154B] hover:bg-[#611f69] text-white">
                {slackConnecting && <LottieLoader size="sm" className="w-4 h-4 mr-2" aria-hidden="true" />}
                Connect Slack
              </Button>
            )}
          </div>
        </div>

        {/* Google Calendar */}
        <div className="bg-white rounded-xl border border-coffee-foam p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/google-calendar-icon.svg" alt="Google Calendar" width={40} height={40} />
              <div>
                <p className="font-medium text-coffee-espresso">Google Calendar</p>
                <p className="text-sm text-coffee-cortado">
                  {meetingProviders.googleCalendar
                    ? (meetingProviders.googleCalendarEmail || "Syncing availability")
                    : "Sync to show when you're free"
                  }
                </p>
              </div>
            </div>
            {meetingProviders.googleCalendar ? (
              <Button variant="outline" size="sm" onClick={disconnectGoogleCalendar} className="text-red-500 hover:text-red-500 border-red-200 hover:bg-red-50">
                <LinkBreak className="w-4 h-4 mr-2" aria-hidden="true" />
                Disconnect Calendar
              </Button>
            ) : (
              <Button onClick={connectGoogleCalendar} className="bg-[#4285F4] hover:bg-[#3367D6] text-white">
                Connect Calendar
              </Button>
            )}
          </div>
        </div>

        {/* Zoom */}
        <div className="bg-white rounded-xl border border-coffee-foam p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/zoom-icon.svg" alt="Zoom" width={40} height={40} />
              <div>
                <p className="font-medium text-coffee-espresso">Zoom</p>
                <p className="text-sm text-coffee-cortado">
                  {meetingProviders.zoom
                    ? (meetingProviders.zoomEmail || "Ready to create meetings")
                    : "Auto-generate meeting links"
                  }
                </p>
              </div>
            </div>
            {meetingProviders.zoom ? (
              <Button variant="outline" size="sm" onClick={disconnectZoom} className="text-red-500 hover:text-red-500 border-red-200 hover:bg-red-50">
                <LinkBreak className="w-4 h-4 mr-2" aria-hidden="true" />
                Disconnect Zoom
              </Button>
            ) : (
              <Button onClick={connectZoom} className="bg-[#2D8CFF] hover:bg-[#2681f2] text-white">
                Connect Zoom
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Organization Section - Show for all users */}
      {org && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-coffee-espresso">Organization</h2>

          <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-4">
            {/* Org Name */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coffee-cream rounded-full flex items-center justify-center">
                <span className="text-coffee-mocha font-bold text-lg">{org.name?.[0]?.toUpperCase() || 'O'}</span>
              </div>
              <div>
                <p className="font-semibold text-coffee-espresso">{org.name}</p>
                <p className="text-sm text-coffee-cortado">{org.isOwner ? 'Owner' : 'Member'}</p>
              </div>
            </div>

            {/* Invite Code */}
            <div className="pt-2 border-t border-coffee-foam">
              <label className="text-sm font-medium text-coffee-cortado mb-2 block">Invite Code</label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-coffee-cream/50 rounded-lg font-mono text-lg tracking-widest text-center border border-coffee-foam text-coffee-espresso">
                  {org.inviteCode}
                </div>
                <Button onClick={copyInviteCode} variant="outline" size="icon" className="shrink-0">
                  {copiedInvite ? <CheckBig className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-coffee-cortado mt-2">Share this code to invite teammates</p>
            </div>

            {/* Team Stats - Admin Only */}
            {org.isOwner && (org.memberCount ?? 0) > 0 && (
              <div className="pt-4 border-t border-coffee-foam">
                <h4 className="text-sm font-medium text-coffee-mocha mb-3">Team Health</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-coffee-cortado">Slack connected</span>
                    <span className="font-medium text-coffee-espresso">{org.slackConnectedCount}/{org.memberCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-coffee-cortado">Expertise filled</span>
                    <span className="font-medium text-coffee-espresso">{org.expertiseFilledCount}/{org.memberCount}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Billing Section - Commented out during beta
      {org?.isOwner && !billingLoading && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-coffee-espresso">Billing</h2>

          <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-coffee-espresso">{getPlanDisplayName(plan)} Plan</p>
                <p className="text-sm text-coffee-cortado">
                  {plan === 'free' ? 'Free forever' : `$${getPlanPricing(plan).monthly}/seat/month`}
                </p>
              </div>
              {subscription?.isOnTrial && (
                <Badge className="bg-coffee-cream text-coffee-mocha">
                  {subscription.trialDaysRemaining} days left in trial
                </Badge>
              )}
            </div>

            {subscription?.hasActiveSubscription && (
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/billing/portal', { method: 'POST' });
                    const data = await response.json();
                    if (data.url) window.location.href = data.url;
                  } catch {
                    toast.error('Failed to open billing portal');
                  }
                }}
              >
                <CreditCard01 className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            )}

            {(plan === 'free' || plan === 'starter') && !subscription?.hasActiveSubscription && (
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
                    if (data.url) window.location.href = data.url;
                  } catch {
                    toast.error('Failed to start checkout');
                  }
                }}
              >
                Upgrade to Pro
                <ArrowRightMd className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </section>
      )}
      */}

      {/* Privacy & Data */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-coffee-espresso">Privacy & Data</h2>

        <div className="bg-white rounded-xl border border-coffee-foam p-5 space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coffee-cream rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-coffee-mocha" />
              </div>
              <div>
                <p className="font-medium text-coffee-espresso">Export Your Data</p>
                <p className="text-sm text-coffee-cortado">Download all your data as JSON</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch('/api/user/export');
                  const data = await response.json();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `attunly-data-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  toast.success('Data exported');
                } catch {
                  toast.error('Failed to export data');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Delete Account */}
          <div className="border-t border-coffee-foam pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <TrashFull className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-coffee-espresso">Delete Account</p>
                  <p className="text-sm text-coffee-cortado">Permanently delete your account</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashFull className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-sm font-medium text-red-600 mb-2">
                  This action cannot be undone.
                </p>
                <p className="text-sm text-coffee-cortado mb-3">
                  Type <span className="font-mono font-bold text-coffee-espresso">DELETE</span> to confirm:
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="max-w-[150px]"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  >
                    {deletingAccount ? <LottieLoader size="sm" className="w-4 h-4" /> : 'Confirm Delete'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SettingsContent />
    </Suspense>
  );
}
