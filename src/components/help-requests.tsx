"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function HelpRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [requestSkill, setRequestSkill] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('open_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setRequests(data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const addRequest = async () => {
    if (!requestSkill.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('open_requests').insert({
        user_id: user.id,
        skill: requestSkill.trim(),
        status: 'open',
      });

      if (error) throw error;

      setRequestSkill("");
      toast.success("Request added", {
        description: `We'll match you with someone who knows ${requestSkill.trim()}`
      });
      loadRequests();
    } catch (error) {
      console.error("Error adding request:", error);
      toast.error("Failed to add request");
    }
  };

  const removeRequest = async (id: string) => {
    try {
      await supabase.from('open_requests').delete().eq('id', id);
      setRequests(requests.filter(r => r.id !== id));
      toast.success("Request removed");
    } catch (error) {
      console.error("Error removing request:", error);
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-ctp-peach" />
          Need Help With Something?
        </CardTitle>
        <CardDescription>
          Add skills you need help with - we'll match you with pod members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="e.g. SQL, React, presenting..."
            value={requestSkill}
            onChange={(e) => setRequestSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRequest()}
            className="h-10"
          />
          <Button onClick={addRequest} className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4">
            Add
          </Button>
        </div>
        {requests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {requests.map(r => (
              <div
                key={r.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
                  r.status === 'notified'
                    ? 'bg-ctp-green/15 text-ctp-green'
                    : 'bg-ctp-peach/15 text-ctp-peach'
                }`}
              >
                <span>{r.skill}</span>
                {r.status === 'notified' && (
                  <span className="text-xs opacity-70">• matched!</span>
                )}
                <button
                  onClick={() => removeRequest(r.id)}
                  className="hover:opacity-70 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
