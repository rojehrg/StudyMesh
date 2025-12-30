"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap, Sparkles } from "lucide-react";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RealtimeContextType {
  isConnected: boolean;
  newNotificationCount: number;
  clearNotificationCount: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  newNotificationCount: 0,
  clearNotificationCount: () => {},
});

export function useRealtime() {
  return useContext(RealtimeContext);
}

interface RealtimeProviderProps {
  children: ReactNode;
  userId: string;
}

export function RealtimeProvider({ children, userId }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const supabase = createClient();

  const clearNotificationCount = useCallback(() => {
    setNewNotificationCount(0);
  }, []);

  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtime = async () => {
      // Create a unique channel name for this user
      channel = supabase.channel(`user-notifications-${userId}`, {
        config: {
          broadcast: { self: true },
        },
      });

      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`,
          },
          (payload) => {
            console.log('[Realtime] New notification received:', payload);
            const notification = payload.new as any;

            // Increment counter
            setNewNotificationCount(prev => prev + 1);

            // Show toast
            const nudgeType = notification.metadata?.nudge_type;
            const isMatch = notification.type === 'new_match';

            if (isMatch) {
              toast.success("New Working Circle Match!", {
                description: notification.content?.slice(0, 100),
                icon: <Sparkles className="w-4 h-4 text-accent" />,
                duration: 5000,
              });
            } else {
              toast.success(
                nudgeType === 'ask' ? "Someone needs your help!" : "Someone offered to help!",
                {
                  description: notification.content?.slice(0, 100),
                  icon: <Zap className="w-4 h-4 text-success" />,
                  duration: 5000,
                }
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('[Realtime] Subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupRealtime();

    return () => {
      if (channel) {
        console.log('[Realtime] Cleaning up channel');
        supabase.removeChannel(channel);
      }
    };
  }, [userId, supabase]);

  return (
    <RealtimeContext.Provider value={{ isConnected, newNotificationCount, clearNotificationCount }}>
      {children}
    </RealtimeContext.Provider>
  );
}
