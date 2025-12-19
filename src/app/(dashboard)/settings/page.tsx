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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Check, User, Briefcase, Clock, MessageCircle, Cloud, CloudOff, Plus, Trash2, Mail, Link2, Unlink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ProficiencyRing } from "@/components/proficiency-ring";
import { SkillAutocomplete } from "@/components/skill-autocomplete";

// Comprehensive list of world timezones organized by region
const TIMEZONES = [
  // Americas
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Denver", label: "Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Anchorage", label: "Anchorage (AKST)" },
  { value: "Pacific/Honolulu", label: "Honolulu (HST)" },
  { value: "America/Phoenix", label: "Phoenix (MST)" },
  { value: "America/Toronto", label: "Toronto (EST/EDT)" },
  { value: "America/Vancouver", label: "Vancouver (PST/PDT)" },
  { value: "America/Mexico_City", label: "Mexico City (CST)" },
  { value: "America/Bogota", label: "Bogota (COT)" },
  { value: "America/Lima", label: "Lima (PET)" },
  { value: "America/Santiago", label: "Santiago (CLT)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "America/Sao_Paulo", label: "Sao Paulo (BRT)" },
  // Europe
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Dublin", label: "Dublin (GMT/IST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)" },
  { value: "Europe/Zurich", label: "Zurich (CET/CEST)" },
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)" },
  { value: "Europe/Oslo", label: "Oslo (CET/CEST)" },
  { value: "Europe/Copenhagen", label: "Copenhagen (CET/CEST)" },
  { value: "Europe/Helsinki", label: "Helsinki (EET/EEST)" },
  { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)" },
  { value: "Europe/Prague", label: "Prague (CET/CEST)" },
  { value: "Europe/Vienna", label: "Vienna (CET/CEST)" },
  { value: "Europe/Athens", label: "Athens (EET/EEST)" },
  { value: "Europe/Bucharest", label: "Bucharest (EET/EEST)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)" },
  // Middle East
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Riyadh", label: "Riyadh (AST)" },
  { value: "Asia/Jerusalem", label: "Jerusalem (IST)" },
  { value: "Asia/Tehran", label: "Tehran (IRST)" },
  { value: "Asia/Kuwait", label: "Kuwait (AST)" },
  { value: "Asia/Qatar", label: "Qatar (AST)" },
  // Asia
  { value: "Asia/Kolkata", label: "Mumbai/Delhi (IST)" },
  { value: "Asia/Karachi", label: "Karachi (PKT)" },
  { value: "Asia/Dhaka", label: "Dhaka (BST)" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)" },
  { value: "Asia/Ho_Chi_Minh", label: "Ho Chi Minh (ICT)" },
  { value: "Asia/Jakarta", label: "Jakarta (WIB)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Kuala_Lumpur", label: "Kuala Lumpur (MYT)" },
  { value: "Asia/Manila", label: "Manila (PHT)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Asia/Shanghai", label: "Shanghai/Beijing (CST)" },
  { value: "Asia/Taipei", label: "Taipei (CST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  // Australia & Pacific
  { value: "Australia/Perth", label: "Perth (AWST)" },
  { value: "Australia/Adelaide", label: "Adelaide (ACST/ACDT)" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Australia/Melbourne", label: "Melbourne (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
  { value: "Pacific/Fiji", label: "Fiji (FJT)" },
  // Africa
  { value: "Africa/Cairo", label: "Cairo (EET)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (SAST)" },
  { value: "Africa/Lagos", label: "Lagos (WAT)" },
  { value: "Africa/Nairobi", label: "Nairobi (EAT)" },
  { value: "Africa/Casablanca", label: "Casablanca (WET)" },
  // UTC
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
];

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

// Generate time options in 30-minute intervals for better UX
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = (i % 2) * 30;
  const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const time12 = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  return { value: time24, label: time12 };
});

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label?: string;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profile, setProfile] = useState<any>(null);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [growthInput, setGrowthInput] = useState("");
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [timezone, setTimezone] = useState("America/New_York");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackConnecting, setSlackConnecting] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const availabilitySaveRef = useRef<NodeJS.Timeout | null>(null);

  const supabase = createClient();

  // Handle Slack OAuth callback result
  useEffect(() => {
    const slackStatus = searchParams.get('slack');
    if (slackStatus === 'success') {
      toast.success("Slack connected successfully!", {
        description: "You'll now receive meeting invites as direct messages."
      });
      // Remove query param from URL
      window.history.replaceState({}, '', '/settings');
      loadProfile(); // Reload to get updated Slack status
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
    loadAvailability();
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
        setProfile({
          ...data,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          expertiseSkills: data.expertise_skills || [],
          growthSkills: data.growth_skills || [],
          slackHandle: data.slack_handle || "",
          slackConnected: data.slack_connected || false,
          slackUserId: data.slack_user_id || "",
          expertiseLevels: data.expertise_levels || {},
          growthLevels: data.growth_levels || {},
        });
        setTimezone(data.timezone || "America/New_York");
        setEmail(data.email || user.email || "");
        setEmailNotifications(data.email_notifications !== false);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('availability_schedules')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (data) {
        setAvailabilitySlots(data.map(slot => ({
          id: slot.id,
          dayOfWeek: slot.day_of_week,
          startTime: slot.start_time,
          endTime: slot.end_time,
          label: slot.label,
        })));
      }
    } catch (error) {
      console.error("Error loading availability:", error);
    }
  };

  const saveProfile = useCallback(async (profileData: any) => {
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
          expertise_skills: profileData.expertiseSkills,
          growth_skills: profileData.growthSkills,
          expertise_levels: profileData.expertiseLevels || {},
          growth_levels: profileData.growthLevels || {},
          preferred_group_size: profileData.preferred_group_size || 3,
          slack_handle: profileData.slackHandle || null,
          timezone: timezone,
          email: email,
          email_notifications: emailNotifications,
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
  }, [supabase, timezone, email, emailNotifications]);

  const saveAvailability = useCallback(async (slots: AvailabilitySlot[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all existing slots and insert new ones
      await supabase
        .from('availability_schedules')
        .delete()
        .eq('user_id', user.id);

      if (slots.length > 0) {
        const { error } = await supabase
          .from('availability_schedules')
          .insert(slots.map(slot => ({
            user_id: user.id,
            day_of_week: slot.dayOfWeek,
            start_time: slot.startTime,
            end_time: slot.endTime,
            label: slot.label || null,
          })));

        if (error) throw error;
      }

      toast.success("Availability saved");
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("Failed to save availability");
    }
  }, [supabase]);

  // Auto-save profile with debounce
  useEffect(() => {
    if (!profile || loading) return;

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

  // Auto-save availability with debounce
  useEffect(() => {
    if (loading) return;

    if (availabilitySaveRef.current) {
      clearTimeout(availabilitySaveRef.current);
    }

    availabilitySaveRef.current = setTimeout(() => {
      saveAvailability(availabilitySlots);
    }, 1500);

    return () => {
      if (availabilitySaveRef.current) {
        clearTimeout(availabilitySaveRef.current);
      }
    };
  }, [availabilitySlots, loading, saveAvailability]);

  const addSkill = (type: 'expertise' | 'growth') => {
    const input = type === 'expertise' ? expertiseInput : growthInput;
    if (!input.trim()) return;

    const skillsKey = type === 'expertise' ? 'expertiseSkills' : 'growthSkills';
    const levelsKey = type === 'expertise' ? 'expertiseLevels' : 'growthLevels';
    const defaultLevel = type === 'expertise' ? 75 : 25;
    const normalized = input.trim();
    if (!profile[skillsKey].includes(normalized)) {
      setProfile({
        ...profile,
        [skillsKey]: [...profile[skillsKey], normalized],
        [levelsKey]: {
          ...(profile[levelsKey] || {}),
          [normalized.toLowerCase()]: defaultLevel,
        }
      });
    }

    if (type === 'expertise') {
      setExpertiseInput("");
    } else {
      setGrowthInput("");
    }
  };

  const removeSkill = (type: 'expertise' | 'growth', skill: string) => {
    const skillsKey = type === 'expertise' ? 'expertiseSkills' : 'growthSkills';
    const levelsKey = type === 'expertise' ? 'expertiseLevels' : 'growthLevels';
    const updatedLevels = { ...(profile[levelsKey] || {}) };
    delete updatedLevels[skill.toLowerCase()];
    setProfile({
      ...profile,
      [skillsKey]: profile[skillsKey].filter((s: string) => s !== skill),
      [levelsKey]: updatedLevels,
    });
  };

  const setLevel = (type: 'expertise' | 'growth', skill: string, value: number) => {
    const key = type === 'expertise' ? 'expertiseLevels' : 'growthLevels';
    const normalized = skill.toLowerCase();
    setProfile({
      ...profile,
      [key]: {
        ...(profile[key] || {}),
        [normalized]: value,
      }
    });
  };

  const addAvailabilitySlot = () => {
    setAvailabilitySlots([...availabilitySlots, {
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
      label: "",
    }]);
  };

  const updateAvailabilitySlot = (index: number, updates: Partial<AvailabilitySlot>) => {
    const newSlots = [...availabilitySlots];
    newSlots[index] = { ...newSlots[index], ...updates };
    setAvailabilitySlots(newSlots);
  };

  const removeAvailabilitySlot = (index: number) => {
    setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  // Quick add for common availability patterns
  const addWeekdayAvailability = () => {
    const newSlots: AvailabilitySlot[] = [1, 2, 3, 4, 5].map(day => ({
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      label: "Work hours",
    }));
    setAvailabilitySlots([...availabilitySlots, ...newSlots]);
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
        setProfile({ ...profile, slackConnected: false, slackUserId: "", slackHandle: "" });
        toast.success("Slack disconnected");
      } else {
        toast.error("Failed to disconnect Slack");
      }
    } catch (error) {
      console.error("Error disconnecting Slack:", error);
      toast.error("Failed to disconnect Slack");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Profile not found. Please complete onboarding.</p>
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
          <p className="text-muted-foreground mt-1">Manage your profile, availability, and preferences</p>
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
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Skills</span>
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
              <CardDescription>Update your work profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={profile.firstName || ""}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={profile.lastName || ""}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Engineering, Sales"
                    value={profile.department || ""}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Job Title</Label>
                  <Input
                    id="major"
                    placeholder="e.g. Senior Account Executive"
                    value={profile.major || ""}
                    onChange={(e) => setProfile({...profile, major: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio / Working Style</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell your team how you work best..."
                  value={profile.bio || ""}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slack">Slack Handle (optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slack"
                    placeholder="@yourhandle or U123ABC"
                    value={profile.slackHandle || ""}
                    onChange={(e) => setProfile({...profile, slackHandle: e.target.value.trim()})}
                  />
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Used for Slack notifications and meeting invites.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expertise</CardTitle>
              <CardDescription>Skills you can mentor others on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillAutocomplete
                value={expertiseInput}
                onChange={setExpertiseInput}
                onAdd={() => addSkill('expertise')}
                placeholder="Add a skill (e.g. Python, Sales)"
                type="expertise"
              />
              <div className="flex flex-col gap-3 min-h-[40px] p-3 bg-muted/50 rounded-xl">
                {profile.expertiseSkills.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No skills added yet...</span>
                )}
                {profile.expertiseSkills.map((skill: string) => {
                  const level = (profile.expertiseLevels || {})[skill.toLowerCase()] ?? 75;
                  const normalizedLevel = level <= 25 ? 25 : level <= 50 ? 50 : level <= 75 ? 75 : 100;
                  return (
                    <div key={skill} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground block mb-2">{skill}</span>
                        <ProficiencyRing
                          value={normalizedLevel}
                          onChange={(val) => setLevel('expertise', skill, val)}
                          size="sm"
                          color="peach"
                        />
                      </div>
                      <button onClick={() => removeSkill('expertise', skill)} className="text-muted-foreground hover:text-destructive p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Areas</CardTitle>
              <CardDescription>Skills you want to learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillAutocomplete
                value={growthInput}
                onChange={setGrowthInput}
                onAdd={() => addSkill('growth')}
                placeholder="Add a skill (e.g. Leadership, SQL)"
                type="growth"
              />
              <div className="flex flex-col gap-3 min-h-[40px] p-3 bg-muted/50 rounded-xl">
                {profile.growthSkills.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No skills added yet...</span>
                )}
                {profile.growthSkills.map((skill: string) => {
                  const level = (profile.growthLevels || {})[skill.toLowerCase()] ?? 25;
                  const normalizedLevel = level <= 25 ? 25 : level <= 50 ? 50 : level <= 75 ? 75 : 100;
                  return (
                    <div key={skill} className="flex items-center gap-3 bg-card rounded-xl px-4 py-3">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground block mb-2">{skill}</span>
                        <ProficiencyRing
                          value={normalizedLevel}
                          onChange={(val) => setLevel('growth', skill, val)}
                          size="sm"
                          color="green"
                        />
                      </div>
                      <button onClick={() => removeSkill('growth', skill)} className="text-muted-foreground hover:text-destructive p-1">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Weekly Schedule</CardTitle>
              <CardDescription>Set your available times so teammates can find the best time to meet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timezone Selection */}
              <div className="space-y-2">
                <Label>Your Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={addWeekdayAvailability}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Weekday 9-5
                </Button>
                <Button variant="outline" size="sm" onClick={addAvailabilitySlot}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Slot
                </Button>
              </div>

              {/* Availability Slots */}
              <div className="space-y-3">
                {availabilitySlots.length === 0 ? (
                  <div className="text-center py-8 bg-muted/30 rounded-xl">
                    <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No availability set yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Add your available times so teammates can schedule with you</p>
                  </div>
                ) : (
                  availabilitySlots.map((slot, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-xl"
                    >
                      <Select
                        value={String(slot.dayOfWeek)}
                        onValueChange={(val) => updateAvailabilitySlot(index, { dayOfWeek: parseInt(val) })}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={String(day.value)}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-2">
                        <Select
                          value={slot.startTime}
                          onValueChange={(val) => updateAvailabilitySlot(index, { startTime: val })}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="Start" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[280px]">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={`start-${time.value}`} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground text-sm">to</span>
                        <Select
                          value={slot.endTime}
                          onValueChange={(val) => updateAvailabilitySlot(index, { endTime: val })}
                        >
                          <SelectTrigger className="w-[110px]">
                            <SelectValue placeholder="End" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[280px]">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={`end-${time.value}`} value={time.value}>
                                {time.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        placeholder="Label (optional)"
                        value={slot.label || ""}
                        onChange={(e) => updateAvailabilitySlot(index, { label: e.target.value })}
                        className="flex-1 min-w-[150px]"
                      />

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAvailabilitySlot(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Visual Weekly Grid */}
              {availabilitySlots.length > 0 && (
                <div className="mt-6">
                  <Label className="mb-3 block">Weekly Overview</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day.value} className="text-center">
                        <div className="text-xs font-medium text-muted-foreground mb-2">{day.short}</div>
                        <div className="space-y-1">
                          {availabilitySlots
                            .filter(slot => slot.dayOfWeek === day.value)
                            .map((slot, idx) => (
                              <div
                                key={idx}
                                className="bg-primary/20 text-primary text-xs py-1 px-1 rounded truncate"
                                title={`${slot.startTime} - ${slot.endTime}${slot.label ? `: ${slot.label}` : ''}`}
                              >
                                {slot.startTime.slice(0, 5)}
                              </div>
                            ))}
                          {availabilitySlots.filter(slot => slot.dayOfWeek === day.value).length === 0 && (
                            <div className="text-xs text-muted-foreground py-1">-</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Collaboration Preferences</CardTitle>
              <CardDescription>How you like to work with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupSize">Preferred Group Size</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min={2}
                  max={10}
                  value={profile.preferred_group_size || 3}
                  onChange={(e) => setProfile({...profile, preferred_group_size: parseInt(e.target.value)})}
                  className="w-24"
                />
                <p className="text-xs text-muted-foreground">Ideal number of people in your working circles (2-10)</p>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Trigger profile save for notification settings
                    if (profile) {
                      setProfile({ ...profile });
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Used for meeting invites and notifications when you're offline</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive email notifications for meeting invites and important updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={(checked) => {
                    setEmailNotifications(checked);
                    // Trigger profile save for notification settings
                    if (profile) {
                      setProfile({ ...profile });
                    }
                  }}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-foreground font-medium">How email notifications work:</p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>• When someone schedules a meeting with you, you'll receive an email with meeting details</li>
                  <li>• Emails include a direct link to join the meeting (Zoom, Google Meet, etc.)</li>
                  <li>• You can accept or decline invites directly from the Meetings page</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Slack Integration</CardTitle>
              <CardDescription>Receive meeting invites directly in Slack DMs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.slackConnected ? (
                // Connected state
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-foreground">Slack Connected</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.slackHandle
                          ? `Connected as ${profile.slackHandle}`
                          : "You'll receive meeting invites as direct messages"}
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
                // Not connected state
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold text-foreground">Connect Slack</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get meeting invites sent directly to your Slack DMs
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

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-foreground font-medium">How Slack notifications work:</p>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                  <li>• Click "Connect to Slack" to authorize Meshflow to send you DMs</li>
                  <li>• Meeting invites will be sent directly to your Slack DMs</li>
                  <li>• Messages include meeting details and a link to join</li>
                  <li>• You can disconnect at any time from this page</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Always enabled for all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground">Bell Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      All meeting invites and updates appear in your notification bell
                    </p>
                  </div>
                </div>
                <span className="text-xs text-primary font-medium px-2 py-1 bg-primary/10 rounded-full">Always On</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
