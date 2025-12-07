"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, X, Check, User, Briefcase, Clock, Sparkles, MessageCircle, Cloud, CloudOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ProficiencyRing } from "@/components/proficiency-ring";
import { SkillAutocomplete } from "@/components/skill-autocomplete";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profile, setProfile] = useState<any>(null);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [growthInput, setGrowthInput] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  const supabase = createClient();

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
        // Parse availability from JSONB - it stores { day: [timeSlots] }
        const availability = data.availability || {};
        const availableDays = Object.keys(availability).filter(day =>
          Array.isArray(availability[day]) && availability[day].length > 0
        );
        // Extract time preferences from any day's slots
        const allTimeSlots = Object.values(availability).flat() as string[];
        const timePrefs = [...new Set(allTimeSlots)];

        setProfile({
          ...data,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          expertiseSkills: data.expertise_skills || [],
          growthSkills: data.growth_skills || [],
          lookingToHelp: data.looking_to_help || false,
          slackHandle: data.slack_handle || "",
          expertiseLevels: data.expertise_levels || {},
          growthLevels: data.growth_levels || {},
          availableDays: availableDays,
          timePreferences: timePrefs,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = useCallback(async (profileData: any) => {
    setSaveStatus('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build availability object from days and time preferences
      const availableDays = profileData.availableDays || [];
      const timePreferences = profileData.timePreferences || [];
      const availability: Record<string, string[]> = {};
      for (const day of availableDays) {
        availability[day] = timePreferences.length > 0 ? timePreferences : ['Flexible'];
      }

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
          looking_to_help: profileData.lookingToHelp || false,
          slack_handle: profileData.slackHandle || null,
          availability: availability,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setSaveStatus('saved');
      lastSavedRef.current = JSON.stringify(profileData);

      // Reset to idle after showing "saved" briefly
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus('error');
      toast.error("Failed to save", {
        description: "Please try again."
      });
    }
  }, [supabase]);

  // Auto-save with debounce when profile changes
  useEffect(() => {
    if (!profile || loading) return;

    const currentData = JSON.stringify(profile);
    if (currentData === lastSavedRef.current) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save - wait 1 second after last change
    saveTimeoutRef.current = setTimeout(() => {
      saveProfile(profile);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [profile, loading, saveProfile]);

  const addSkill = (type: 'expertise' | 'growth') => {
    const input = type === 'expertise' ? expertiseInput : growthInput;
    if (!input.trim()) return;

    const skillsKey = type === 'expertise' ? 'expertiseSkills' : 'growthSkills';
    const levelsKey = type === 'expertise' ? 'expertiseLevels' : 'growthLevels';
    // Default: Expertise = Advanced (75), Growth = Beginner (25)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
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
          <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
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
            Profile
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Preferences
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
                <p className="text-xs text-muted-foreground">Used for "Message on Slack" and optional nudge webhook.</p>
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
              <div className="flex flex-col gap-3 min-h-[40px] p-3 bg-muted/50 rounded-xl border">
                {profile.expertiseSkills.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No skills added yet...</span>
                )}
                {profile.expertiseSkills.map((skill: string) => {
                  const level = (profile.expertiseLevels || {})[skill.toLowerCase()] ?? 75;
                  // Normalize old values to quadrant values
                  const normalizedLevel = level <= 25 ? 25 : level <= 50 ? 50 : level <= 75 ? 75 : 100;
                  return (
                    <div key={skill} className="flex items-center gap-3 bg-card rounded-xl border px-4 py-3 shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground block mb-2">{skill}</span>
                        <ProficiencyRing
                          value={normalizedLevel}
                          onChange={(val) => setLevel('expertise', skill, val)}
                          size="sm"
                          color="teal"
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
              <div className="flex flex-col gap-3 min-h-[40px] p-3 bg-muted/50 rounded-xl border">
                {profile.growthSkills.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">No skills added yet...</span>
                )}
                {profile.growthSkills.map((skill: string) => {
                  const level = (profile.growthLevels || {})[skill.toLowerCase()] ?? 25;
                  // Normalize old values to quadrant values
                  const normalizedLevel = level <= 25 ? 25 : level <= 50 ? 50 : level <= 75 ? 75 : 100;
                  return (
                    <div key={skill} className="flex items-center gap-3 bg-card rounded-xl border px-4 py-3 shadow-sm">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-foreground block mb-2">{skill}</span>
                        <ProficiencyRing
                          value={normalizedLevel}
                          onChange={(val) => setLevel('growth', skill, val)}
                          size="sm"
                          color="cyan"
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

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Preferences</CardTitle>
              <CardDescription>How you like to work with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Looking to Help Status */}
              <div className="flex items-center justify-between p-4 bg-primary/10 border-2 border-primary/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-foreground">Looking to Help</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Show teammates you're actively available to mentor and assist
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.lookingToHelp}
                  onCheckedChange={(checked) => setProfile({...profile, lookingToHelp: checked})}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

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

              <div className="space-y-3">
                <Label>General Availability</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                    const isChecked = (profile.availableDays || []).includes(day);
                    return (
                      <label
                        key={day}
                        className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-all ${
                          isChecked
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const days = profile.availableDays || [];
                            const newDays = e.target.checked
                              ? [...days, day]
                              : days.filter((d: string) => d !== day);
                            setProfile({ ...profile, availableDays: newDays });
                          }}
                          className="w-4 h-4 text-primary rounded border-border focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-medium text-foreground">{day}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Select days you're typically available for collaboration</p>
              </div>

              <div className="space-y-3">
                <Label>Preferred Times</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'Morning', label: 'Morning (8AM-12PM)' },
                    { value: 'Afternoon', label: 'Afternoon (12PM-5PM)' },
                    { value: 'Evening', label: 'Evening (5PM-9PM)' },
                    { value: 'Flexible', label: 'Flexible' },
                  ].map(({ value, label }) => {
                    const isChecked = (profile.timePreferences || []).includes(value);
                    return (
                      <label
                        key={value}
                        className={`flex items-center gap-2 cursor-pointer p-3 rounded-xl border transition-all ${
                          isChecked
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const times = profile.timePreferences || [];
                            const newTimes = e.target.checked
                              ? [...times, value]
                              : times.filter((t: string) => t !== value);
                            setProfile({ ...profile, timePreferences: newTimes });
                          }}
                          className="w-4 h-4 text-primary rounded border-border focus:ring-primary accent-primary"
                        />
                        <span className="text-sm font-medium text-foreground">{label}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">When you're most available to help teammates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

