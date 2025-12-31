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

  // Get user email and auto-detect timezone on mount
  useEffect(() => {
    const init = async () => {
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }

      // Auto-detect timezone
      try {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const matchedTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === detectedTimezone);
        if (matchedTimezone) {
          setFormData(prev => ({ ...prev, timezone: detectedTimezone }));
        }
      } catch (e) {
        // Fallback to default
      }
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

      toast.success("Profile completed!", {
        description: "Welcome to Meshflow!"
      });
      // Redirect to dashboard
      router.push("/dashboard");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="h-16 px-8 flex items-center justify-between border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center gap-0.5 hover:opacity-90 transition-opacity">
          <span className="font-bold text-xl text-violet-600">Mesh</span>
          <span className="font-bold text-xl text-gray-900">flow</span>
        </Link>
        {userEmail && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
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
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-600"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
            <span className={step >= 1 ? "text-violet-600" : ""}>About You</span>
            <span className={step >= 2 ? "text-violet-600" : ""}>Skills</span>
            <span className={step >= 3 ? "text-violet-600" : ""}>Bio</span>
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
              <Card className="shadow-lg border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Tell us about yourself</CardTitle>
                  <CardDescription className="text-gray-500">This helps us match you with the right pods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept" className="text-gray-700">Department</Label>
                    <Input
                      id="dept"
                      placeholder="e.g. Engineering, Sales, Product"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700">Job Title</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Senior Account Executive"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="h-11 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end pt-2">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.firstName || !formData.lastName || !formData.department || !formData.role}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-6"
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
              <Card className="shadow-lg border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Your Capabilities</CardTitle>
                  <CardDescription className="text-gray-500">What can you teach? What do you want to learn?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Expertise */}
                  <div className="space-y-3">
                    <Label className="text-emerald-600 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" weight="duotone" /> Expertise (I can mentor others)
                    </Label>
                    <SkillAutocomplete
                      value={formData.skillInput}
                      onChange={(val) => setFormData({...formData, skillInput: val})}
                      onAdd={() => handleAddSkill('expertise')}
                      placeholder="Add a skill (e.g. Python, Sales)"
                      type="expertise"
                    />
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {formData.expertiseSkills.length === 0 && (
                        <span className="text-sm text-gray-400 italic p-1">No skills added yet...</span>
                      )}
                      {formData.expertiseSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 pl-3 pr-1 py-1.5 text-sm">
                          {skill}
                          <button onClick={() => handleRemoveSkill('expertise', skill)} className="ml-2 hover:bg-emerald-300 rounded-full p-0.5 transition-colors">
                            <X className="h-3.5 w-3.5" weight="duotone" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="space-y-3">
                    <Label className="text-violet-600 font-semibold flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" weight="duotone" /> Growth Areas (I want to learn)
                    </Label>
                    <SkillAutocomplete
                      value={formData.growthInput}
                      onChange={(val) => setFormData({...formData, growthInput: val})}
                      onAdd={() => handleAddSkill('growth')}
                      placeholder="Add a skill (e.g. Leadership, SQL)"
                      type="growth"
                    />
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-200">
                       {formData.growthSkills.length === 0 && (
                        <span className="text-sm text-gray-400 italic p-1">No skills added yet...</span>
                      )}
                      {formData.growthSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200 pl-3 pr-1 py-1.5 text-sm">
                          {skill}
                          <button onClick={() => handleRemoveSkill('growth', skill)} className="ml-2 hover:bg-violet-300 rounded-full p-0.5 transition-colors">
                            <X className="h-3.5 w-3.5" weight="duotone" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">Back</Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={formData.expertiseSkills.length === 0}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-6"
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
              <Card className="shadow-lg border-gray-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Final Polish</CardTitle>
                  <CardDescription className="text-gray-500">How can teammates partner with you?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-gray-700">
                      <GlobeHemisphereWest className="w-4 h-4 text-violet-600" weight="duotone" />
                      Your Timezone
                    </Label>
                    <p className="text-sm text-gray-500">
                      We auto-detected your timezone. Change it if needed for accurate meeting suggestions.
                    </p>
                    <Popover open={timezoneOpen} onOpenChange={setTimezoneOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-11 font-normal bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                        >
                          <span className="truncate">{selectedTimezoneLabel}</span>
                          <CaretDown className="h-4 w-4 opacity-50 shrink-0" weight="duotone" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0 bg-white border-gray-200" align="start">
                        <div className="p-2 border-b border-gray-200">
                          <div className="relative">
                            <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" weight="duotone" />
                            <Input
                              placeholder="Search timezone..."
                              value={timezoneSearch}
                              onChange={(e) => setTimezoneSearch(e.target.value)}
                              className="pl-8 h-9 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
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
                                className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded-md hover:bg-violet-50 transition-colors text-gray-700 ${
                                  formData.timezone === tz.value ? "bg-violet-50" : ""
                                }`}
                              >
                                <span>{tz.label}</span>
                                {formData.timezone === tz.value && (
                                  <CheckCircle className="h-4 w-4 text-violet-600" weight="duotone" />
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
                    <Label htmlFor="bio" className="text-gray-700">Bio / Working Style</Label>
                    <Textarea
                      id="bio"
                      className="min-h-[120px] text-base resize-none bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      placeholder="I'm usually available in the mornings. I prefer async reviews but happy to jump on a call for complex blockers."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">Back</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-11 px-8 transition-all active:scale-95"
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
