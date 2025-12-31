"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CircleNotch, ArrowLeft, Sparkle, GlobeHemisphereWest } from "@phosphor-icons/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

function generatePodCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CreatePodPage() {
  const [loading, setLoading] = useState(false);
  const [podName, setPodName] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [initiativeOwner, setInitiativeOwner] = useState("");
  const [term, setTerm] = useState("");
  const [allowCrossPodHelp, setAllowCrossPodHelp] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const podCode = generatePodCode();

      // Create pod with manager (creator is manager by default)
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .insert({
          pod_code: podCode,
          pod_name: podName,
          business_unit: businessUnit,
          initiative_owner: initiativeOwner,
          term: term || null,
          created_by: user.id,
          manager_id: user.id,
          allow_cross_pod_help: allowCrossPodHelp,
        })
        .select()
        .single();

      if (podError) throw podError;

      // Add creator as first member
      const { error: memberError } = await supabase
        .from('pod_members')
        .insert({
          pod_id: pod.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success("Pod created successfully!", {
        description: `Share code: ${podCode}`
      });
      router.push(`/classes/${podCode}`);
    } catch (error: any) {
      console.error("Error creating pod:", error);
      const errorMessage = error?.message || error?.error_description || (typeof error === 'string' ? error : "Please try again.");
      toast.error("Failed to create pod", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/classes">
          <ArrowLeft className="mr-2 h-4 w-4" weight="duotone" />
          Back to Pods
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkle className="w-6 h-6 text-accent" weight="duotone" />
            Create Enablement Pod
          </CardTitle>
          <CardDescription>
            Set up a new pod for your team to collaborate and fill knowledge gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="podName">
                Pod Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="podName"
                placeholder="e.g. Q1 Sales Enablement"
                value={podName}
                onChange={(e) => setPodName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessUnit">Business Unit</Label>
              <Input
                id="businessUnit"
                placeholder="e.g. Sales, Engineering, Product"
                value={businessUnit}
                onChange={(e) => setBusinessUnit(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initiativeOwner">Initiative Owner</Label>
              <Input
                id="initiativeOwner"
                placeholder="e.g. John Doe"
                value={initiativeOwner}
                onChange={(e) => setInitiativeOwner(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Who's leading this initiative?
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="term">Term / Period</Label>
              <Input
                id="term"
                placeholder="e.g. Q1 2025, Jan-Mar"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Cross-Pod Help Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <GlobeHemisphereWest className="w-5 h-5 text-primary" weight="duotone" />
                </div>
                <div>
                  <Label className="text-base font-semibold text-foreground">Allow Cross-Pod Help</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Members can receive help requests from people outside this pod
                  </p>
                </div>
              </div>
              <Switch
                checked={allowCrossPodHelp}
                onCheckedChange={setAllowCrossPodHelp}
                disabled={loading}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <p className="text-sm text-primary font-medium mb-1">
                What happens next?
              </p>
              <p className="text-sm text-muted-foreground">
                You'll get a unique share code. Teammates can join using this code, set their availability, and start nudging each other for help.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !podName.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
              >
                {loading ? <CircleNotch className="mr-2 h-4 w-4 animate-spin" weight="duotone" /> : null}
                Create Pod
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

