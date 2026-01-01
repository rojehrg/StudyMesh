"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CircleNotch, ArrowRight, CheckCircle, GlobeHemisphereWest, CaretDown, MagnifyingGlass, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SkillAutocomplete } from "@/components/skill-autocomplete";
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

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState("");
  const [timezoneOpen, setTimezoneOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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
    expertiseSkills: [] as string[],
    growthSkills: [] as string[],
    skillInput: "",
    growthInput: "",
  });

  // Get user data and pre-populate from Slack profile on mount
  useEffect(() => {
    const init = async () => {
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    };
    init();
  }, [supabase]);

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

  const handleAddSkill = (type: 'expertise' | 'growth') => {
    const input = type === 'expertise' ? formData.skillInput : formData.growthInput;
    if (!input.trim()) return;

    if (type === 'expertise') {
      if (!formData.expertiseSkills.includes(input.trim())) {
        setFormData(prev => ({
          ...prev,
          expertiseSkills: [...prev.expertiseSkills, input.trim()],
          skillInput: ""
        }));
      }
    } else {
      if (!formData.growthSkills.includes(input.trim())) {
        setFormData(prev => ({
          ...prev,
          growthSkills: [...prev.growthSkills, input.trim()],
          growthInput: ""
        }));
      }
    }
  };

  const handleRemoveSkill = (type: 'expertise' | 'growth', skill: string) => {
    if (type === 'expertise') {
      setFormData(prev => ({
        ...prev,
        expertiseSkills: prev.expertiseSkills.filter(s => s !== skill)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        growthSkills: prev.growthSkills.filter(s => s !== skill)
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Insert into 'profiles' table using Supabase client
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          department: formData.department,
          major: formData.role, // Mapping 'Job Title' to 'major' column
          bio: formData.bio,
          timezone: formData.timezone,
          expertise_skills: formData.expertiseSkills,
          growth_skills: formData.growthSkills,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      // Check if user has an organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.organization_id) {
        toast.success("Profile completed!", {
          description: "Welcome to Attunly!"
        });
        router.push("/dashboard");
      } else {
        toast.success("Profile completed!", {
          description: "Now let's set up your team"
        });
        router.push("/org-setup");
      }
      router.refresh();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile", {
        description: "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-0.5 hover:opacity-90 transition-opacity">
          <span className="font-bold text-xl text-primary">Mesh</span>
          <span className="font-bold text-xl text-foreground">flow</span>
        </Link>
        {userEmail && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <SignOut className="w-4 h-4" weight="duotone" />
              Log out
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="mb-8">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground font-medium">
            <span className={step >= 1 ? "text-primary" : ""}>About You</span>
            <span className={step >= 2 ? "text-primary" : ""}>Skills</span>
            <span className={step >= 3 ? "text-primary" : ""}>Bio</span>
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
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Tell us about yourself</CardTitle>
                  <CardDescription className="text-muted-foreground">This helps us match you with the right pods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept" className="text-foreground">Department</Label>
                    <Input
                      id="dept"
                      placeholder="e.g. Engineering, Sales, Product"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground">Job Title</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Senior Account Executive"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end pt-2">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.firstName || !formData.lastName || !formData.department || !formData.role}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" weight="duotone" />
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
              <Card className="shadow-lg border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Your Capabilities</CardTitle>
                  <CardDescription className="text-muted-foreground">What can you teach? What do you want to learn?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Expertise */}
                  <div className="space-y-3">
                    <Label className="text-success font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" weight="duotone" /> Expertise (I can mentor others)
                    </Label>
                    <SkillAutocomplete
                      value={formData.skillInput}
                      onChange={(val) => setFormData({...formData, skillInput: val})}
                      onAdd={() => handleAddSkill('expertise')}
                      placeholder="Add a skill (e.g. Python, Sales)"
                      type="expertise"
                    />
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-muted rounded-lg border border-border">
                      {formData.expertiseSkills.length === 0 && (
                        <span className="text-sm text-muted-foreground italic p-1">No skills added yet...</span>
                      )}
                      {formData.expertiseSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-success/15 text-success hover:bg-success/25 pl-3 pr-1 py-1.5 text-sm">
                          {skill}
                          <button onClick={() => handleRemoveSkill('expertise', skill)} className="ml-2 hover:bg-success/30 rounded-full p-0.5 transition-colors">
                            <X className="h-3.5 w-3.5" weight="duotone" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="space-y-3">
                    <Label className="text-primary font-semibold flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" weight="duotone" /> Growth Areas (I want to learn)
                    </Label>
                    <SkillAutocomplete
                      value={formData.growthInput}
                      onChange={(val) => setFormData({...formData, growthInput: val})}
                      onAdd={() => handleAddSkill('growth')}
                      placeholder="Add a skill (e.g. Leadership, SQL)"
                      type="growth"
                    />
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-muted rounded-lg border border-border">
                       {formData.growthSkills.length === 0 && (
                        <span className="text-sm text-muted-foreground italic p-1">No skills added yet...</span>
                      )}
                      {formData.growthSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-primary/15 text-primary hover:bg-primary/25 pl-3 pr-1 py-1.5 text-sm">
                          {skill}
                          <button onClick={() => handleRemoveSkill('growth', skill)} className="ml-2 hover:bg-primary/30 rounded-full p-0.5 transition-colors">
                            <X className="h-3.5 w-3.5" weight="duotone" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground hover:bg-accent">Back</Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={formData.expertiseSkills.length === 0}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" weight="duotone" />
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
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Final Polish</CardTitle>
                  <CardDescription className="text-muted-foreground">How can teammates partner with you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-foreground">
                      <GlobeHemisphereWest className="w-4 h-4 text-primary" weight="duotone" />
                      Your Timezone
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      We auto-detected your timezone. Change it if needed for accurate meeting suggestions.
                    </p>
                    <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-11 font-normal bg-background border-input text-foreground hover:bg-accent"
                        >
                          <span className="truncate">{selectedTimezoneLabel}</span>
                          <CaretDown className="h-4 w-4 opacity-50 shrink-0" weight="duotone" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0 bg-popover border-border" align="start">
                        <div className="p-2 border-b border-border">
                          <div className="relative">
                            <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="duotone" />
                            <Input
                              placeholder="Search timezone..."
                              value={timezoneSearch}
                              onChange={(e) => setTimezoneSearch(e.target.value)}
                              className="pl-8 h-9 bg-background border-input text-foreground placeholder:text-muted-foreground"
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-[250px]">
                          <div className="p-1">
                            {filteredTimezones.map((tz) => (
                              <button
                                key={tz.value}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, timezone: tz.value }));
                                  setTimezoneOpen(false);
                                  setTimezoneSearch("");
                                }}
                                className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors text-foreground ${
                                  formData.timezone === tz.value ? "bg-accent" : ""
                                }`}
                              >
                                <span>{tz.label}</span>
                                {formData.timezone === tz.value && (
                                  <CheckCircle className="h-4 w-4 text-primary" weight="duotone" />
                                )}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground">Bio / Working Style</Label>
                    <Textarea
                      id="bio"
                      className="min-h-[120px] text-base resize-none bg-background border-input text-foreground placeholder:text-muted-foreground"
                      placeholder="I'm usually available in the mornings. I prefer async reviews but happy to jump on a call for complex blockers."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground hover:bg-accent">Back</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-8 transition-all active:scale-95"
                  >
                    {loading && <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="duotone" />}
                    Complete Profile
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
