"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { SkillAutocomplete } from "@/components/skill-autocomplete";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    role: "",
    bio: "",
    expertiseSkills: [] as string[],
    growthSkills: [] as string[],
    skillInput: "",
    growthInput: "",
  });

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
          expertise_skills: formData.expertiseSkills,
          growth_skills: formData.growthSkills,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Profile completed!", {
        description: "Let's find your first matches!"
      });
      // Redirect to Working Circles to show immediate matches
      router.push("/groups");
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
    <div className="min-h-screen bg-ctp-base flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-ctp-peach"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500 font-medium">
            <span className={step >= 1 ? "text-ctp-peach" : ""}>About You</span>
            <span className={step >= 2 ? "text-ctp-peach" : ""}>Skills</span>
            <span className={step >= 3 ? "text-ctp-peach" : ""}>Bio</span>
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
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
                  <CardDescription>This helps us match you with the right pods.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Input
                      id="dept"
                      placeholder="e.g. Engineering, Sales, Product"
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Job Title</Label>
                    <Input
                      id="role"
                      placeholder="e.g. Senior Account Executive"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end pt-2">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.firstName || !formData.lastName || !formData.department || !formData.role}
                    className="bg-ctp-peach hover:bg-peach-400 text-ctp-base h-11 px-6"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
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
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Capabilities</CardTitle>
                  <CardDescription>What can you teach? What do you want to learn?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Expertise */}
                  <div className="space-y-3">
                    <Label className="text-ctp-peach font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Expertise (I can mentor others)
                    </Label>
                    <SkillAutocomplete
                      value={formData.skillInput}
                      onChange={(val) => setFormData({...formData, skillInput: val})}
                      onAdd={() => handleAddSkill('expertise')}
                      placeholder="Add a skill (e.g. Python, Sales)"
                      type="expertise"
                    />
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-ctp-base rounded-lg border border-gray-100">
                      {formData.expertiseSkills.length === 0 && (
                        <span className="text-sm text-gray-400 italic p-1">No skills added yet...</span>
                      )}
                      {formData.expertiseSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-ctp-peach/20 text-ctp-peach hover:bg-ctp-peach/30 pl-3 pr-1 py-1.5 text-sm">
                          {skill}
                          <button onClick={() => handleRemoveSkill('expertise', skill)} className="ml-2 hover:bg-ctp-peach/40 rounded-full p-0.5 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="space-y-3">
                    <Label className="text-ctp-green font-semibold flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" /> Growth Areas (I want to learn)
                    </Label>
                    <SkillAutocomplete
                      value={formData.growthInput}
                      onChange={(val) => setFormData({...formData, growthInput: val})}
                      onAdd={() => handleAddSkill('growth')}
                      placeholder="Add a skill (e.g. Leadership, SQL)"
                      type="growth"
                    />
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-ctp-base rounded-lg border border-gray-100">
                       {formData.growthSkills.length === 0 && (
                        <span className="text-sm text-gray-400 italic p-1">No skills added yet...</span>
                      )}
                      {formData.growthSkills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-ctp-green/20 text-ctp-green hover:bg-ctp-green/30 pl-3 pr-1 py-1.5 text-sm">
                          {skill}
                          <button onClick={() => handleRemoveSkill('growth', skill)} className="ml-2 hover:bg-ctp-green/40 rounded-full p-0.5 transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={formData.expertiseSkills.length === 0}
                    className="bg-ctp-peach hover:bg-peach-400 text-ctp-base h-11 px-6"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
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
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl">Final Polish</CardTitle>
                  <CardDescription>How can teammates partner with you?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio / Working Style</Label>
                    <Textarea 
                      id="bio"
                      className="min-h-[150px] text-base resize-none"
                      placeholder="I'm usually available in the mornings. I prefer async reviews but happy to jump on a call for complex blockers."
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="bg-ctp-peach hover:bg-peach-400 text-ctp-base h-11 px-8 transition-all active:scale-95"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Complete Profile
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
