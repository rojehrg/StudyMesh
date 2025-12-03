"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Users, Building2, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function JoinPodPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [podCode, setPodCode] = useState("");
  const [podPreview, setPodPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const checkPodCode = async () => {
    if (!podCode.trim()) return;
    
    setChecking(true);
    setError(null);
    setPodPreview(null);

    try {
      const { data: pod, error } = await supabase
        .from('pods')
        .select('*')
        .eq('pod_code', podCode.toUpperCase().trim())
        .single();

      if (error || !pod) {
        setError("Pod not found. Please check the code and try again.");
        return;
      }

      // Get member count
      const { count } = await supabase
        .from('pod_members')
        .select('*', { count: 'exact', head: true })
        .eq('pod_id', pod.id);

      // Check if user is already a member
      const { data: { user } } = await supabase.auth.getUser();
      const { data: existingMember } = await supabase
        .from('pod_members')
        .select('id')
        .eq('pod_id', pod.id)
        .eq('user_id', user?.id)
        .single();

      setPodPreview({
        ...pod,
        memberCount: count || 0,
        alreadyMember: !!existingMember
      });
    } catch (error) {
      console.error("Error checking pod:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const handleJoin = async () => {
    if (!podPreview) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Add user as member
      const { error } = await supabase
        .from('pod_members')
        .insert({
          pod_id: podPreview.id,
          user_id: user.id,
        });

      if (error) throw error;

      toast.success("Joined pod successfully!", {
        description: podPreview.pod_name
      });
      router.push(`/classes/${podPreview.pod_code}`);
    } catch (error: any) {
      console.error("Error joining pod:", error);
      toast.error("Failed to join pod", {
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
          <CardTitle className="text-2xl">Join Enablement Pod</CardTitle>
          <CardDescription>
            Enter a pod code to join an existing enablement pod
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="podCode">Pod Code</Label>
              <div className="flex gap-2">
                <Input
                  id="podCode"
                  placeholder="e.g. ABC123"
                  value={podCode}
                  onChange={(e) => {
                    setPodCode(e.target.value.toUpperCase());
                    setPodPreview(null);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && checkPodCode()}
                  disabled={checking || loading}
                  className="font-mono text-lg"
                  maxLength={6}
                />
                <Button 
                  onClick={checkPodCode}
                  disabled={checking || !podCode.trim() || loading}
                  variant="outline"
                >
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>

            {podPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-2 border-teal-200 rounded-xl p-6 bg-teal-50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {podPreview.pod_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      {podPreview.business_unit || "General"}
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-teal-300 font-mono text-sm font-medium text-teal-700">
                    {podPreview.pod_code}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {podPreview.initiative_owner && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Owner:</span> {podPreview.initiative_owner}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Members:</span> {podPreview.memberCount}
                  </div>
                </div>

                {podPreview.alreadyMember ? (
                  <div className="mt-6 bg-white border border-teal-200 rounded-lg p-3">
                    <p className="text-sm text-teal-700 font-medium">
                      ✅ You're already a member of this pod
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleJoin}
                    disabled={loading}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Join This Pod
                  </Button>
                )}
              </motion.div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">
              💡 Don't have a code?
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Ask your team lead or initiative owner for the pod code, or create your own pod to get started.
            </p>
            <Button variant="outline" asChild className="w-full">
              <Link href="/classes/create">Create New Pod</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

