"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { HandHelping, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LookingToHelpToggleProps {
  initialValue: boolean;
  userId: string;
}

export function LookingToHelpToggle({ initialValue, userId }: LookingToHelpToggleProps) {
  const [isLooking, setIsLooking] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleToggle = async (checked: boolean) => {
    setLoading(true);
    try {
      // Get current availability
      const { data: profile } = await supabase
        .from('profiles')
        .select('availability')
        .eq('user_id', userId)
        .single();

      const currentAvailability = profile?.availability || {};

      // Update with new lookingToHelp value
      const { error } = await supabase
        .from('profiles')
        .update({
          availability: {
            ...currentAvailability,
            lookingToHelp: checked
          }
        })
        .eq('user_id', userId);

      if (error) throw error;

      setIsLooking(checked);
      toast.success(checked ? "You're now visible as looking to help!" : "Status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors ${
      isLooking
        ? 'bg-accent/10 border-accent/30'
        : 'bg-muted/50 border-border'
    }`}>
      <HandHelping className={`w-5 h-5 ${isLooking ? 'text-accent' : 'text-muted-foreground'}`} />
      <div className="flex-1">
        <p className={`text-sm font-medium ${isLooking ? 'text-accent' : 'text-muted-foreground'}`}>
          {isLooking ? "Looking to help" : "Not looking to help"}
        </p>
      </div>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={isLooking}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-accent"
        />
      )}
    </div>
  );
}
