"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CloseMd, ArrowRightMd, CheckBig, Globe, ChevronDown, SearchMagnifyingGlass, LogOut, Clock, Link as LinkIcon, Star } from "react-coolicons";
import { LottieLoader } from "@/components/loading-states";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

// Timezone options
const TIMEZONE_OPTIONS = [
  { label: "Pacific Time (Los Angeles)", value: "America/Los_Angeles", region: "Americas" },
  { label: "Mountain Time (Denver)", value: "America/Denver", region: "Americas" },
  { label: "Central Time (Chicago)", value: "America/Chicago", region: "Americas" },
  { label: "Eastern Time (New York)", value: "America/New_York", region: "Americas" },
  { label: "Alaska (Anchorage)", value: "America/Anchorage", region: "Americas" },
  { label: "Hawaii (Honolulu)", value: "Pacific/Honolulu", region: "Americas" },
  { label: "Toronto", value: "America/Toronto", region: "Americas" },
  { label: "UTC / GMT", value: "UTC", region: "Europe" },
  { label: "London (GMT/BST)", value: "Europe/London", region: "Europe" },
  { label: "Paris (CET)", value: "Europe/Paris", region: "Europe" },
  { label: "Berlin (CET)", value: "Europe/Berlin", region: "Europe" },
  { label: "Amsterdam", value: "Europe/Amsterdam", region: "Europe" },
  { label: "Dubai (GST)", value: "Asia/Dubai", region: "Asia" },
  { label: "Mumbai (Kolkata)", value: "Asia/Kolkata", region: "Asia" },
  { label: "Singapore", value: "Asia/Singapore", region: "Asia" },
  { label: "Hong Kong", value: "Asia/Hong_Kong", region: "Asia" },
  { label: "Tokyo", value: "Asia/Tokyo", region: "Asia" },
  { label: "Sydney (AEST)", value: "Australia/Sydney", region: "Pacific" },
  { label: "Auckland", value: "Pacific/Auckland", region: "Pacific" },
];

// Availability presets for quick setup
const AVAILABILITY_PRESETS = [
  {
    id: "morning",
    label: "Morning Person",
    description: "Best 8 AM - 12 PM",
    icon: "🌅",
    hours: { start: 8, end: 12 },
  },
  {
    id: "core",
    label: "Core Hours",
    description: "9 AM - 5 PM",
    icon: "☀️",
    hours: { start: 9, end: 17 },
  },
  {
    id: "afternoon",
    label: "Afternoon Focus",
    description: "Best 1 PM - 6 PM",
    icon: "🌤️",
    hours: { start: 13, end: 18 },
  },
  {
    id: "flexible",
    label: "Flexible",
    description: "Available throughout",
    icon: "🔄",
    hours: { start: 9, end: 18 },
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    role: "",
    bio: "",
    timezone: "America/New_York",
    expertiseDescription: "", // Natural language: what I can help with
    growthDescription: "", // Natural language: what I want to learn
    availabilityPreset: "core",
  });

  // Get user data and pre-populate from Slack profile on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('[Onboarding] Auth error:', userError);
          setInitialLoading(false);
          return;
        }

        if (!user) {
          console.log('[Onboarding] No user found, redirecting to login');
          window.location.href = '/login';
          return;
        }

        console.log('[Onboarding] User found:', user.id);
        setUserId(user.id);

        if (user.email) {
          setUserEmail(user.email);
        }

        // Fetch existing profile (may have Slack data pre-filled)
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, timezone, avatar_url')
          .eq('user_id', user.id)
          .single();

        // Pre-populate from profile (Slack data) or user metadata
        const firstName = profile?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '';
        const lastName = profile?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';

        // Use profile timezone, or auto-detect
        let timezone = profile?.timezone || 'America/New_York';
        if (!profile?.timezone) {
          try {
            const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const matchedTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === detectedTimezone);
            if (matchedTimezone) {
              timezone = detectedTimezone;
            }
          } catch (e) {
            // Fallback to default
          }
        }

        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          timezone,
        }));
      } catch (error) {
        console.error('[Onboarding] Init error:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Force hard navigation to clear all state
    window.location.href = "/login";
  };

  const filteredTimezones = TIMEZONE_OPTIONS.filter(tz =>
    tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
    tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
  );

  const selectedTimezoneLabel = TIMEZONE_OPTIONS.find(tz => tz.value === formData.timezone)?.label || formData.timezone;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Use the userId we stored on page load
      if (!userId) {
        console.error('[Onboarding] No userId stored, attempting to fetch again');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error('[Onboarding] Auth error on submit:', userError);
          toast.error("Session expired", {
            description: "Please log in again"
          });
          router.push('/login');
          return;
        }
        setUserId(user.id);
      }

      const currentUserId = userId;
      if (!currentUserId) {
        throw new Error("No user found");
      }

      console.log('[Onboarding] Saving profile for user:', currentUserId);

      // Insert into 'profiles' table using Supabase client
      // Store natural language descriptions - AI will process these for matching
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUserId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          department: formData.department,
          major: formData.role, // Mapping 'Job Title' to 'major' column
          bio: formData.bio,
          timezone: formData.timezone,
          expertise_skills: [formData.expertiseDescription], // Store as array for compatibility
          growth_skills: [formData.growthDescription], // Store as array for compatibility
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('[Onboarding] Database error:', error);
        throw error;
      }

      console.log('[Onboarding] Profile saved successfully');

      // Check if user has an organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', currentUserId)
        .single();

      // Show celebration first
      setShowCelebration(true);

      // Wait for celebration animation, then redirect
      setTimeout(() => {
        if (profile?.organization_id) {
          router.push("/dashboard");
        } else {
          router.push("/org-setup");
        }
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile", {
        description: "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LottieLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/icon.png" alt="Attunly" className="w-7 h-7" />
          <span className="font-bold text-xl">
            <span className="text-foreground">Attun</span>
            <span className="text-primary">ly</span>
          </span>
        </Link>
        {userEmail && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-3xl">
          {/* Progress Bar */}
          <div className="mb-10">
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-muted-foreground font-medium">
            <span className={step >= 1 ? "text-primary" : ""}>Profile</span>
            <span className={step >= 2 ? "text-primary" : ""}>AI Matching</span>
            <span className={step >= 3 ? "text-primary" : ""}>Timezone</span>
            <span className={step >= 4 ? "text-primary" : ""}>Availability</span>
            <span className={step >= 5 ? "text-primary" : ""}>Connect</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl text-foreground">Tell us about yourself</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">This helps us match you with the right pods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-base text-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-base text-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept" className="text-base text-foreground">Department</Label>
                    <Input
                      id="dept"
                      placeholder="e.g. Engineering, Sales, Product"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-base text-foreground">Job Title</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Senior Account Executive"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="h-12 text-base bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end pt-4">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.firstName || !formData.lastName || !formData.department || !formData.role}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
                  >
                    Next <ArrowRightMd className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg border-border bg-card overflow-hidden">
                {/* AI Header with gradient accent */}
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-5 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">AI-Powered Matching</h2>
                      <p className="text-base text-muted-foreground">Describe yourself naturally - our AI handles the rest</p>
                    </div>
                  </div>
                </div>

                <CardContent className="space-y-6 pt-6 px-8">
                  {/* Info banner */}
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-base text-muted-foreground">
                      Our AI uses natural language to understand your expertise and connect you with teammates who can help - or who need your help. Just write like you're describing yourself to a colleague.
                    </p>
                  </div>

                  {/* What I can help with */}
                  <div className="space-y-3">
                    <Label className="text-base text-foreground font-medium flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-success" />
                      What I can help others with
                    </Label>
                    <Textarea
                      value={formData.expertiseDescription}
                      onChange={(e) => setFormData({...formData, expertiseDescription: e.target.value})}
                      placeholder="e.g. I'm experienced in Python and data analysis. I've built several ML models and can help with pandas, scikit-learn, and general coding best practices. Also happy to mentor on career growth in tech."
                      className="min-h-[130px] text-base resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      Think: skills, tools, experiences, advice you can share
                    </p>
                  </div>

                  {/* What I want to learn */}
                  <div className="space-y-3">
                    <Label className="text-base text-foreground font-medium flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      What I want to learn or get help with
                    </Label>
                    <Textarea
                      value={formData.growthDescription}
                      onChange={(e) => setFormData({...formData, growthDescription: e.target.value})}
                      placeholder="e.g. I'd love to improve my presentation skills and learn more about product management. Also interested in learning React and modern frontend development."
                      className="min-h-[130px] text-base resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-sm text-muted-foreground">
                      Think: skills you're developing, areas you're curious about, challenges you're facing
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between pt-4 pb-6 px-8">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground hover:bg-accent h-12 px-6 text-base">Back</Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.expertiseDescription.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
                  >
                    Next <ArrowRightMd className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl text-foreground">Final Polish</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">How can teammates partner with you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timezone */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base text-foreground">
                      <Globe className="w-5 h-5 text-primary" />
                      Your Timezone
                    </Label>
                    <p className="text-base text-muted-foreground">
                      We auto-detected your timezone. Change it if needed for accurate meeting suggestions.
                    </p>
                    <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-12 text-base font-normal bg-background border-input text-foreground hover:bg-accent"
                        >
                          <span className="truncate">{selectedTimezoneLabel}</span>
                          <ChevronDown className="h-5 w-5 opacity-50 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0 bg-popover border-border" align="start">
                        <div className="p-3 border-b border-border">
                          <div className="relative">
                            <SearchMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search timezone..."
                              value={timezoneSearch}
                              onChange={(e) => setTimezoneSearch(e.target.value)}
                              className="pl-9 h-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-[280px]">
                          <div className="p-1">
                            {filteredTimezones.map((tz) => (
                              <button
                                key={tz.value}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, timezone: tz.value }));
                                  setTimezoneOpen(false);
                                  setTimezoneSearch("");
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 text-base rounded-md hover:bg-accent transition-colors text-foreground ${
                                  formData.timezone === tz.value ? "bg-accent" : ""
                                }`}
                              >
                                <span>{tz.label}</span>
                                {formData.timezone === tz.value && (
                                  <CheckBig className="h-5 w-5 text-primary" />
                                )}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Bio */}
                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-base text-foreground">Bio / Working Style</Label>
                    <Textarea
                      id="bio"
                      className="min-h-[130px] text-base resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                      placeholder="I'm usually available in the mornings. I prefer async reviews but happy to jump on a call for complex blockers."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground hover:bg-accent h-12 px-6 text-base">Back</Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
                  >
                    Next <ArrowRightMd className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl text-foreground">When are you available?</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">Help teammates know the best time to reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {AVAILABILITY_PRESETS.map((preset) => {
                      const isSelected = formData.availabilityPreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setFormData(prev => ({ ...prev, availabilityPreset: preset.id }))}
                          className={cn(
                            "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all h-[140px]",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <CheckBig className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                          <span className="text-4xl mb-2">{preset.icon}</span>
                          <span className="font-semibold text-lg text-foreground">{preset.label}</span>
                          <span className="text-base text-muted-foreground">{preset.description}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-base text-muted-foreground text-center pt-2">
                    You can customize your detailed schedule in Settings later.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground hover:bg-accent h-12 px-6 text-base">Back</Button>
                  <Button
                    onClick={() => setStep(5)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base"
                  >
                    Next <ArrowRightMd className="ml-2 h-5 w-5" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 5 && !showCelebration && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-lg border-border bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl text-foreground">Connect Your Tools</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">Get nudge notifications where you already work.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Slack */}
                  <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center">
                        <img src="/slack-icon.svg" alt="Slack" className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-medium text-lg text-foreground">Slack</p>
                        <p className="text-base text-muted-foreground">Receive nudges as DMs</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open('/api/slack/oauth', '_blank')}
                      className="border-[#4A154B] text-[#4A154B] hover:bg-[#4A154B]/10 h-11 px-5 text-base"
                    >
                      Connect
                    </Button>
                  </div>

                  {/* Zoom */}
                  <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white border border-border flex items-center justify-center">
                        <img src="/zoom-icon.svg" alt="Zoom" className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-medium text-lg text-foreground">Zoom</p>
                        <p className="text-base text-muted-foreground">Auto-create meeting links</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open('/api/auth/zoom', '_blank')}
                      className="border-[#2D8CFF] text-[#2D8CFF] hover:bg-[#2D8CFF]/10 h-11 px-5 text-base"
                    >
                      Connect
                    </Button>
                  </div>

                  <p className="text-base text-muted-foreground text-center pt-2">
                    You can skip this and connect later in Settings.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <Button variant="ghost" onClick={() => setStep(4)} className="text-muted-foreground hover:text-foreground hover:bg-accent h-12 px-6 text-base">Back</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 text-base transition-all active:scale-95"
                  >
                    {loading && <LottieLoader size="sm" className="w-5 h-5 mr-2" />}
                    Complete Profile
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {/* Celebration Screen */}
          {showCelebration && (
            <motion.div
              key="celebration"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-8xl mb-6"
              >
                🎉
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold text-foreground mb-3"
              >
                You're all set!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Welcome to Attunly, {formData.firstName}!
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center gap-2"
              >
                <span className="text-2xl animate-bounce" style={{ animationDelay: "0ms" }}>✨</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: "100ms" }}>🚀</span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: "200ms" }}>💜</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
