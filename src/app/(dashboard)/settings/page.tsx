"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, X, Save, User, Briefcase, Clock, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [growthInput, setGrowthInput] = useState("");
  
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
        setProfile({
          ...data,
          expertiseSkills: data.expertise_skills || [],
          growthSkills: data.growth_skills || [],
          lookingToHelp: data.looking_to_help || false,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          department: profile.department,
          major: profile.major,
          bio: profile.bio,
          expertise_skills: profile.expertiseSkills,
          growth_skills: profile.growthSkills,
          preferred_group_size: profile.preferred_group_size || 3,
          looking_to_help: profile.lookingToHelp || false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save", {
        description: "Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (type: 'expertise' | 'growth') => {
    const input = type === 'expertise' ? expertiseInput : growthInput;
    if (!input.trim()) return;

    const skillsKey = type === 'expertise' ? 'expertiseSkills' : 'growthSkills';
    if (!profile[skillsKey].includes(input.trim())) {
      setProfile({
        ...profile,
        [skillsKey]: [...profile[skillsKey], input.trim()]
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
    setProfile({
      ...profile,
      [skillsKey]: profile[skillsKey].filter((s: string) => s !== skill)
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
        <p className="text-gray-500">Profile not found. Please complete onboarding.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your profile and preferences</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
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
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g. Python, Sales)"
                  value={expertiseInput}
                  onChange={(e) => setExpertiseInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill('expertise')}
                />
                <Button onClick={() => addSkill('expertise')} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border">
                {profile.expertiseSkills.length === 0 && (
                  <span className="text-sm text-gray-400 italic">No skills added yet...</span>
                )}
                {profile.expertiseSkills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="bg-teal-100 text-teal-700 hover:bg-teal-200 pl-3 pr-1 py-1.5">
                    {skill}
                    <button onClick={() => removeSkill('expertise', skill)} className="ml-2 hover:bg-teal-300 rounded-full p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Areas</CardTitle>
              <CardDescription>Skills you want to learn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (e.g. Leadership, SQL)"
                  value={growthInput}
                  onChange={(e) => setGrowthInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill('growth')}
                />
                <Button onClick={() => addSkill('growth')} size="icon" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border">
                {profile.growthSkills.length === 0 && (
                  <span className="text-sm text-gray-400 italic">No skills added yet...</span>
                )}
                {profile.growthSkills.map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 pl-3 pr-1 py-1.5">
                    {skill}
                    <button onClick={() => removeSkill('growth', skill)} className="ml-2 hover:bg-cyan-300 rounded-full p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
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
              <div className="flex items-center justify-between p-4 bg-teal-50 border-2 border-teal-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-900">Looking to Help</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Show teammates you're actively available to mentor and assist
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.lookingToHelp}
                  onCheckedChange={(checked) => setProfile({...profile, lookingToHelp: checked})}
                  className="data-[state=checked]:bg-teal-600"
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
                <p className="text-xs text-gray-500">Ideal number of people in your working circles (2-10)</p>
              </div>

              <div className="space-y-3">
                <Label>General Availability</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                      <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                      <span className="text-sm font-medium text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Select days you're typically available for collaboration</p>
              </div>

              <div className="space-y-3">
                <Label>Preferred Time Zones</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                    <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                    <span className="text-sm font-medium text-gray-700">Morning (8AM-12PM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                    <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                    <span className="text-sm font-medium text-gray-700">Afternoon (12PM-5PM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                    <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                    <span className="text-sm font-medium text-gray-700">Evening (5PM-9PM)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border hover:border-teal-300 hover:bg-teal-50/30 transition-all">
                    <input type="checkbox" className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500" />
                    <span className="text-sm font-medium text-gray-700">Flexible</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">When you're most available to help teammates</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

