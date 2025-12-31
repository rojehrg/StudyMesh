"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { NotificationToast } from "@/components/notification-toast";

interface RealtimeContextType {
  isConnected: boolean;
  newNotificationCount: number;
  clearNotificationCount: () => void;
  triggerRefresh: () => void;
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  newNotificationCount: 0,
  clearNotificationCount: () => {},
  triggerRefresh: () => {},
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
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  const clearNotificationCount = useCallback(() => {
    setNewNotificationCount(0);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
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

            // Show custom toast
            setCurrentNotification(notification);

            // Trigger refresh for components that need it
            triggerRefresh();
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
  }, [userId, supabase, triggerRefresh]);

  const handleNotificationAction = () => {
    if (currentNotification?.type === 'nudge') {
      router.push('/notifications');
    } else if (currentNotification?.type === 'nudge_response' && currentNotification?.metadata?.accepted) {
      const podCode = currentNotification.metadata?.pod_code;
      const senderId = currentNotification.sender_id;
      if (podCode && senderId) {
        // Navigate with schedule param to auto-open meeting dialog with sender pre-selected
        router.push(`/classes/${podCode}?schedule=${senderId}`);
      } else if (podCode) {
        router.push(`/classes/${podCode}`);
      } else {
        router.push('/meetings');
      }
    } else if (currentNotification?.metadata?.pod_code) {
      router.push(`/classes/${currentNotification.metadata.pod_code}`);
    } else {
      router.push('/notifications');
    }
  };

  return (
    <RealtimeContext.Provider value={{ isConnected, newNotificationCount, clearNotificationCount, triggerRefresh }}>
      {children}
      <NotificationToast
        notification={currentNotification}
        onDismiss={() => setCurrentNotification(null)}
        onAction={handleNotificationAction}
      />
    </RealtimeContext.Provider>
  );
}
