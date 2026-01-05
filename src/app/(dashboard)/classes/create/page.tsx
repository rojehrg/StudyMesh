"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Star, Globe, TrendingUp } from "react-coolicons";
import { LottieLoader } from "@/components/loading-states";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CreatePodPage() {
  const [loading, setLoading] = useState(false);
  const [podName, setPodName] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [initiativeOwner, setInitiativeOwner] = useState("");
  const [term, setTerm] = useState("");
  const [allowCrossPodHelp, setAllowCrossPodHelp] = useState(true);

  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/pods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          podName,
          businessUnit,
          initiativeOwner,
          term: term || null,
          allowCrossPodHelp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle pod limit reached
        if (data.code === 'POD_LIMIT_REACHED') {
          toast.error("Pod limit reached", {
            description: data.message,
            action: {
              label: "Upgrade",
              onClick: () => router.push(data.upgradeUrl),
            },
          });
          return;
        }
        throw new Error(data.error || "Failed to create pod");
      }

      toast.success("Pod created successfully!", {
        description: `Share code: ${data.podCode}`
      });
      router.push(`/classes/${data.podCode}`);
    } catch (error: any) {
      console.error("Error creating pod:", error);
      toast.error("Failed to create pod", {
        description: error.message || "Please try again."
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
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Pods
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Create Pod
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
                  <Globe className="w-5 h-5 text-primary" />
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

            <div className="bg-muted/50 border border-border rounded-xl p-4">
              <p className="text-sm text-foreground font-medium mb-1">
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
                {loading ? <LottieLoader size="sm" className="w-4 h-4 mr-2" /> : null}
                Create Pod
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

