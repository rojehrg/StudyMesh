"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Buildings, UserPlus, ArrowRight, CircleNotch, SignOut } from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
      const { data: { user } } = await supabase.auth.getUser();
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
        <div className="w-full max-w-lg">
          {mode === 'choose' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Join your team</h1>
                <p className="text-muted-foreground">Create a new organization or join an existing one</p>
              </div>

              <div className="grid gap-4">
                <Card
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all bg-card"
                  onClick={() => setMode('create')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Buildings className="w-6 h-6 text-primary" weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Create Organization</h3>
                      <p className="text-sm text-muted-foreground">Start fresh and invite your team</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" weight="duotone" />
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all bg-card"
                  onClick={() => setMode('join')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
                      <UserPlus className="w-6 h-6 text-success" weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Join with Invite Code</h3>
                      <p className="text-sm text-muted-foreground">Enter a code from your team admin</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" weight="duotone" />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="shadow-lg border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Create Organization</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    You'll get an invite code to share with your team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-foreground">Organization Name</Label>
                    <Input
                      id="orgName"
                      placeholder="e.g. Acme Inc, Engineering Team"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground"
                      onKeyDown={e => e.key === 'Enter' && handleCreateOrg()}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setMode('choose')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateOrg}
                    disabled={loading || !orgName.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6"
                  >
                    {loading && <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="duotone" />}
                    Create Organization
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="shadow-lg border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">Join Organization</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Enter the invite code from your team admin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inviteCode" className="text-foreground">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      placeholder="e.g. ABC123"
                      value={inviteCode}
                      onChange={e => setInviteCode(e.target.value.toUpperCase())}
                      className="h-11 bg-background border-input text-foreground placeholder:text-muted-foreground uppercase tracking-widest text-center text-lg font-mono"
                      maxLength={6}
                      onKeyDown={e => e.key === 'Enter' && handleJoinOrg()}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setMode('choose')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinOrg}
                    disabled={loading || !inviteCode.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-6"
                  >
                    {loading && <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="duotone" />}
                    Join Organization
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
