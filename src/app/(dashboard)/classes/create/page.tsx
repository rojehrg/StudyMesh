"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Sparkles } from "lucide-react";
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
  
  const router = useRouter();
  const supabase = createClient();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const podCode = generatePodCode();

      // Create pod
      const { data: pod, error: podError } = await supabase
        .from('pods')
        .insert({
          pod_code: podCode,
          pod_name: podName,
          business_unit: businessUnit,
          initiative_owner: initiativeOwner,
          term: term || null,
          created_by: user.id,
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
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pods
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-terra-400" />
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
                Pod Name <span className="text-red-500">*</span>
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
              <p className="text-xs text-gray-500">
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

            <div className="bg-terra-50 border border-terra-100 rounded-xl p-4">
              <p className="text-sm text-terra-600 font-medium mb-1">
                🎯 What happens next?
              </p>
              <p className="text-sm text-terra-500">
                After creating your pod, you'll get a unique share code. Your teammates can use this code to join and our matching algorithm will identify knowledge gaps automatically.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !podName.trim()}
                className="bg-terra-400 hover:bg-terra-500 flex-1"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Pod
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

