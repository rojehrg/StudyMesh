"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LottieLoader } from "@/components/loading-states";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowRightMd, LogOut } from "react-coolicons";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form State - simplified
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    aboutMe: "", // Natural language: skills, interests, what you can help with
  });

  // Get user data on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Use getSession first - it reads from cookies without server verification
        // This is more reliable right after OAuth redirect
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[Onboarding] Session error:', sessionError);
        }

        // If no session from cookies, try getUser as fallback
        let user = session?.user ?? null;
        if (!user) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('[Onboarding] User error:', userError);
          }
          user = userData?.user ?? null;
        }

        if (!user) {
          console.log('[Onboarding] No user found, redirecting to login');
          window.location.href = '/login';
          return;
        }

        setUserId(user.id);
        if (user.email) setUserEmail(user.email);

        // Fetch existing profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();

        // Pre-populate from profile or user metadata
        const firstName = profile?.first_name || user.user_metadata?.full_name?.split(' ')[0] || '';
        const lastName = profile?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';

        setFormData(prev => ({ ...prev, firstName, lastName }));
      } catch (error) {
        console.error('[Onboarding] Init error:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleSubmit = async (connectSlack = false) => {
    setLoading(true);
    try {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Session expired", { description: "Please log in again" });
          router.push('/login');
          return;
        }
        setUserId(user.id);
      }

      const currentUserId = userId;
      if (!currentUserId) throw new Error("No user found");

      // Auto-detect timezone
      let timezone = 'America/New_York';
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (e) {}

      // Save profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: currentUserId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          major: formData.role,
          expertise_skills: [formData.aboutMe],
          timezone,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      if (connectSlack) {
        // Open Slack OAuth in same window, it will redirect back
        window.location.href = '/api/slack/oauth?redirect=/org-setup';
        return;
      }

      // Show celebration then redirect
      setShowCelebration(true);
      setTimeout(() => {
        router.push("/org-setup");
        router.refresh();
      }, 1500);

    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile", { description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-coffee-paper flex items-center justify-center">
        <LottieLoader size="lg" />
      </div>
    );
  }

  const isStep1Valid = formData.firstName && formData.lastName && formData.role && formData.aboutMe.trim().length > 20;

  return (
    <div
      className="min-h-screen bg-coffee-paper"
      style={{ fontFamily: '"Source Serif 4", "Source Serif Pro", Georgia, serif' }}
    >
      {/* Header */}
      <header className="h-16 px-6 md:px-12 flex items-center justify-between border-b border-coffee-foam">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="/logo.svg" alt="" className="w-7 h-7" />
          <span className="text-xl font-semibold text-coffee-espresso">attunly</span>
        </Link>
        {userEmail && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-coffee-cortado">{userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="flex items-center justify-center p-6 min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="mb-8">
            <div className="h-1.5 bg-coffee-foam rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-coffee-espresso"
                initial={{ width: "0%" }}
                animate={{ width: step === 1 ? "50%" : "100%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-coffee-latte">
              <span className={step >= 1 ? "text-coffee-espresso font-medium" : ""}>About You</span>
              <span className={step >= 2 ? "text-coffee-espresso font-medium" : ""}>Connect</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: About You */}
            {step === 1 && !showCelebration && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl border border-coffee-foam p-8 shadow-sm"
              >
                <h1 className="text-2xl font-semibold text-coffee-espresso mb-1">
                  Tell us about yourself
                </h1>
                <p className="text-coffee-cortado mb-6">
                  This helps teammates know who to reach out to.
                </p>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-coffee-mocha mb-1.5 block">
                        First name
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        placeholder="Jane"
                        autoComplete="off"
                        className="h-11 bg-white border-coffee-foam text-coffee-espresso placeholder:text-coffee-latte focus:border-coffee-mocha focus:ring-1 focus:ring-coffee-mocha/30 focus:outline-none font-sans [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-coffee-mocha mb-1.5 block">
                        Last name
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        placeholder="Smith"
                        autoComplete="off"
                        className="h-11 bg-white border-coffee-foam text-coffee-espresso placeholder:text-coffee-latte focus:border-coffee-mocha focus:ring-1 focus:ring-coffee-mocha/30 focus:outline-none font-sans [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="role" className="text-sm font-medium text-coffee-mocha mb-1.5 block">
                      Your role
                    </Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      placeholder="e.g. Senior Product Manager"
                      autoComplete="off"
                      className="h-11 bg-white border-coffee-foam text-coffee-espresso placeholder:text-coffee-latte focus:border-coffee-mocha focus:ring-1 focus:ring-coffee-mocha/30 focus:outline-none font-sans [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="aboutMe" className="text-sm font-medium text-coffee-mocha mb-1.5 block">
                      About you
                    </Label>
                    <p className="text-sm text-coffee-latte mb-2">
                      What do you know? What can you help with? What are you learning?
                    </p>
                    <Textarea
                      id="aboutMe"
                      value={formData.aboutMe}
                      onChange={e => setFormData({...formData, aboutMe: e.target.value})}
                      placeholder="I've been in product for 5 years, specializing in B2B SaaS. I can help with roadmap prioritization, stakeholder management, and writing PRDs. Currently learning more about AI/ML product strategy and would love to connect with folks who have experience there."
                      className="min-h-[140px] bg-white border-coffee-foam text-coffee-espresso placeholder:text-coffee-latte focus:border-coffee-mocha focus:ring-1 focus:ring-coffee-mocha/30 focus:outline-none resize-none font-sans text-[15px]"
                    />
                    <p className="text-xs text-coffee-latte mt-1.5">
                      Write naturally — our AI uses this to match you with teammates.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!isStep1Valid}
                    className={`h-11 px-6 font-medium transition-colors ${
                      isStep1Valid
                        ? 'bg-coffee-espresso hover:bg-coffee-roast text-coffee-paper'
                        : 'bg-coffee-steamed text-coffee-cortado cursor-not-allowed'
                    }`}
                  >
                    Continue <ArrowRightMd className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Connect Slack */}
            {step === 2 && !showCelebration && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl border border-coffee-foam p-8 shadow-sm"
              >
                <h1 className="text-2xl font-semibold text-coffee-espresso mb-1">
                  Connect Slack
                </h1>
                <p className="text-coffee-cortado mb-6">
                  Get matched with teammates right where you work.
                </p>

                <div className="p-5 rounded-xl border border-coffee-foam bg-coffee-cream/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-coffee-foam flex items-center justify-center">
                      <img src="/slack-icon.svg" alt="Slack" className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-medium text-coffee-espresso">Slack</p>
                      <p className="text-sm text-coffee-cortado">Use /attunly to find teammates</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="w-full bg-[#4A154B] hover:bg-[#3a1039] text-white h-11 font-medium"
                  >
                    {loading ? <LottieLoader size="sm" className="w-5 h-5 mr-2" /> : null}
                    Connect Slack
                  </Button>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-coffee-foam" />
                  <span className="text-sm text-coffee-latte">or</span>
                  <div className="flex-1 h-px bg-coffee-foam" />
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
                  >
                    ← Back
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="border-coffee-foam text-coffee-mocha hover:bg-coffee-cream h-11 px-6"
                  >
                    {loading ? <LottieLoader size="sm" className="w-5 h-5 mr-2" /> : null}
                    Skip for now
                  </Button>
                </div>

                <p className="text-xs text-coffee-latte text-center mt-4">
                  You can always connect Slack later in Settings.
                </p>
              </motion.div>
            )}

            {/* Celebration - calm, on-brand */}
            {showCelebration && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-16 h-16 rounded-full bg-coffee-cream border border-coffee-foam flex items-center justify-center mx-auto mb-6"
                >
                  <svg className="w-8 h-8 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-semibold text-coffee-espresso mb-2">
                  Welcome, {formData.firstName}
                </h2>
                <p className="text-coffee-cortado">
                  Setting up your workspace...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
