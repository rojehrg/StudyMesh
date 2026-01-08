"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { LogOut } from "react-coolicons";

export default function OrgSetupPage() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      // Use getSession first - more reliable right after OAuth redirect
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        router.push('/login');
        return;
      }
      setUserEmail(user.email || null);

      // Check if user already has an org
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.organization_id) {
        router.push('/dashboard');
      }
    };
    init();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleCreateOrg = async () => {
    if (!orgName.trim()) {
      toast.error("Please enter an organization name");
      return;
    }

    setLoading(true);
    try {
      // Check if user has a trial plan stored from signup
      const trialPlan = localStorage.getItem('trial_plan');

      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName.trim(),
          trialPlan: trialPlan || undefined,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create organization');
      }

      // Clear trial plan from localStorage after successful org creation
      localStorage.removeItem('trial_plan');

      toast.success("Organization created!", {
        description: `Invite code: ${data.inviteCode}`
      });

      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error creating org:", error);
      toast.error("Failed to create organization", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrg = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          inviteCode: inviteCode.trim().toUpperCase()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "Invalid invite code") {
          toast.error("Invalid invite code", {
            description: "Please check the code and try again"
          });
        } else {
          throw new Error(data.error || 'Failed to join organization');
        }
        setLoading(false);
        return;
      }

      toast.success(data.message || `Joined ${data.organization?.name}!`);
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Error joining org:", error);
      toast.error("Failed to join organization", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

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
          {mode === 'choose' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-semibold text-coffee-espresso mb-2">Join your team</h1>
                <p className="text-coffee-cortado">Create a new organization or join an existing one</p>
              </div>

              <div className="grid gap-4">
                <div
                  className="cursor-pointer bg-white rounded-2xl border border-coffee-foam p-6 shadow-sm hover:border-coffee-latte hover:shadow-md transition-all flex items-center gap-4"
                  onClick={() => setMode('create')}
                >
                  <div className="w-12 h-12 rounded-xl bg-coffee-cream flex items-center justify-center">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-espresso">Create Organization</h3>
                    <p className="text-sm text-coffee-cortado">Start fresh and invite your team</p>
                  </div>
                  <svg className="w-5 h-5 text-coffee-latte" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div
                  className="cursor-pointer bg-white rounded-2xl border border-coffee-foam p-6 shadow-sm hover:border-coffee-latte hover:shadow-md transition-all flex items-center gap-4"
                  onClick={() => setMode('join')}
                >
                  <div className="w-12 h-12 rounded-xl bg-coffee-cream flex items-center justify-center">
                    <svg className="w-6 h-6 text-coffee-espresso" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-coffee-espresso">Join with Invite Code</h3>
                    <p className="text-sm text-coffee-cortado">Enter a code from your team admin</p>
                  </div>
                  <svg className="w-5 h-5 text-coffee-latte" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-coffee-foam p-8 shadow-sm"
            >
              <h1 className="text-2xl font-semibold text-coffee-espresso mb-1">
                Create Organization
              </h1>
              <p className="text-coffee-cortado mb-6">
                You'll get an invite code to share with your team
              </p>

              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-sm font-medium text-coffee-mocha mb-1.5 block">
                  Organization Name
                </Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Inc, Engineering Team"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="h-11 bg-white border-coffee-foam text-coffee-espresso placeholder:text-coffee-latte focus:ring-coffee-mocha font-sans"
                  onKeyDown={e => e.key === 'Enter' && handleCreateOrg()}
                />
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setMode('choose')}
                  className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
                >
                  ← Back
                </button>
                <Button
                  onClick={handleCreateOrg}
                  disabled={loading || !orgName.trim()}
                  className="bg-coffee-espresso hover:bg-coffee-roast text-coffee-paper h-11 px-6 font-medium"
                >
                  {loading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Create Organization
                </Button>
              </div>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-coffee-foam p-8 shadow-sm"
            >
              <h1 className="text-2xl font-semibold text-coffee-espresso mb-1">
                Join Organization
              </h1>
              <p className="text-coffee-cortado mb-6">
                Enter the invite code from your team admin
              </p>

              <div className="space-y-2">
                <Label htmlFor="inviteCode" className="text-sm font-medium text-coffee-mocha mb-1.5 block">
                  Invite Code
                </Label>
                <Input
                  id="inviteCode"
                  placeholder="e.g. ABC123"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  className="h-11 bg-white border-coffee-foam text-coffee-espresso placeholder:text-coffee-latte focus:ring-coffee-mocha uppercase tracking-widest text-center text-lg font-mono"
                  maxLength={6}
                  onKeyDown={e => e.key === 'Enter' && handleJoinOrg()}
                />
              </div>

              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={() => setMode('choose')}
                  className="text-sm text-coffee-cortado hover:text-coffee-espresso transition-colors"
                >
                  ← Back
                </button>
                <Button
                  onClick={handleJoinOrg}
                  disabled={loading || !inviteCode.trim()}
                  className="bg-coffee-espresso hover:bg-coffee-roast text-coffee-paper h-11 px-6 font-medium"
                >
                  {loading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  Join Organization
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
