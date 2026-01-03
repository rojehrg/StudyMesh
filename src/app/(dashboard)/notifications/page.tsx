"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, Checks, X, CircleNotch, PaperPlaneTilt, Sparkle, Lightning, Check, CalendarBlank } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { PageLoader } from "@/components/loading-states";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Load notifications and set up realtime
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setCurrentUserId(user.id);
        userIdRef.current = user.id;

        // Load notifications
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setNotifications(data || []);

        const { data: sent } = await supabase
          .from('notifications')
          .select('*')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setSentNotifications(sent || []);

        // Set up realtime subscription for list updates (toasts handled by RealtimeProvider)
        const channelName = `notifications-page-${user.id}-${Date.now()}`;
        channel = supabase.channel(channelName);

        channel
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `recipient_id=eq.${user.id}`,
            },
            (payload) => {
              const newNotification = payload.new as any;
              setNotifications(prev => [newNotification, ...prev]);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `sender_id=eq.${user.id}`,
            },
            (payload) => {
              const newNotification = payload.new as any;
              setSentNotifications(prev => [newNotification, ...prev]);
            }
          )
          .subscribe();

      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, router]);

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);

    // Navigate based on notification type and metadata
    const metadata = notification.metadata || {};
    if (notification.type === 'new_match') {
      // Navigate to Working Circles to see the new match
      router.push('/groups');
    } else if (notification.type === 'nudge' && metadata.pod_code) {
      // Navigate to pod page where they can respond and schedule
      router.push(`/classes/${metadata.pod_code}`);
    } else if (notification.type === 'meeting_invite' && metadata.meeting_id) {
      // Navigate to meetings page
      router.push('/meetings');
    } else if (metadata.pod_code) {
      router.push(`/classes/${metadata.pod_code}`);
    }
  };

  const handleNudgeResponse = async (notification: any, accepted: boolean) => {
    try {
      const metadata = notification.metadata || {};

      // Update notification with response
      await supabase
        .from('notifications')
        .update({
          read: true,
          metadata: {
            ...metadata,
            responded: true,
            accepted
          }
        })
        .eq('id', notification.id);

      // Update local state
      setNotifications(notifications.map(n =>
        n.id === notification.id
          ? { ...n, read: true, metadata: { ...n.metadata, responded: true, accepted } }
          : n
      ));

      // Send response notification to the original sender (sender_id is a column, not in metadata)
      const originalSenderId = notification.sender_id;
      if (originalSenderId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', user.id)
            .single();

          const senderName = profile ? `${profile.first_name} ${profile.last_name}` : 'Someone';

          // If accepted, create scheduling permission for the RECEIVER (current user)
          // This ensures only the nudge receiver can schedule a meeting
          if (accepted) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

            // Get pod_id from pod_code if available
            let podId = null;
            if (metadata.pod_code) {
              const { data: pod } = await supabase
                .from('pods')
                .select('id')
                .eq('pod_code', metadata.pod_code)
                .single();
              podId = pod?.id;
            }

            await supabase.from('scheduling_permissions').insert({
              nudge_id: notification.id,
              authorized_user_id: user.id, // Receiver can schedule
              with_user_id: originalSenderId, // With the sender
              pod_id: podId,
              expires_at: expiresAt.toISOString()
            });
          }

          // Create in-app notification
          await supabase.from('notifications').insert({
            recipient_id: originalSenderId,
            sender_id: user.id,
            type: 'nudge_response',
            content: accepted
              ? `${senderName} accepted your nudge and wants to connect!`
              : `${senderName} isn't available right now.`,
            metadata: {
              pod_code: metadata.pod_code,
              accepted,
              original_nudge_id: notification.id
            }
          });

          // Send Slack/email notification to original sender
          fetch('/api/slack/nudge-response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientUserId: originalSenderId,
              responderName: senderName,
              accepted,
              topic: metadata.topic,
              podCode: metadata.pod_code
            }),
          }).catch((err) => console.error('[NudgeResponse] Failed to send notification:', err));
        }
      }

      toast.success(accepted ? "Nudge accepted! Let's schedule a time." : "Response sent");

      // If accepted, navigate to pod to schedule
      if (accepted && metadata.pod_code) {
        router.push(`/classes/${metadata.pod_code}?schedule=${originalSenderId}`);
      }
    } catch (error) {
      console.error("Error responding to nudge:", error);
      toast.error("Failed to respond");
    }
  };

  const getNotificationIcon = (notification: any, isSent: boolean) => {
    if (isSent) {
      return <PaperPlaneTilt className="w-5 h-5 text-muted-foreground" weight="duotone" />;
    }
    if (notification.type === 'new_match') {
      return <Sparkle className={`w-5 h-5 ${!notification.read ? 'text-accent' : 'text-muted-foreground'}`} weight="duotone" />;
    }
    return <Bell className={`w-5 h-5 ${!notification.read ? 'text-accent' : 'text-muted-foreground'}`} weight="duotone" />;
  };

  const getNotificationTitle = (notification: any, isSent: boolean) => {
    if (notification.type === 'new_match') {
      return 'New Match Found';
    }
    if (notification.type === 'nudge') {
      return isSent ? 'Nudge Sent' : 'Nudge Received';
    }
    if (notification.type === 'nudge_response') {
      return notification.metadata?.accepted ? 'Nudge Accepted!' : 'Nudge Response';
    }
    if (notification.type === 'meeting_invite') {
      return 'Meeting Invitation';
    }
    return 'Notification';
  };

  const getNotificationBgClass = (notification: any) => {
    if (notification.type === 'new_match' && !notification.read) {
      return 'border-l-4 border-l-warning bg-warning/5';
    }
    if (!notification.read) {
      return 'border-l-4 border-l-accent bg-accent/5';
    }
    return '';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <PageLoader message="Loading your notifications..." />;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderList = (items: any[], isSent: boolean) => {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={isSent ? PaperPlaneTilt : Bell}
          title={isSent ? "No sent nudges yet" : "All caught up!"}
          description={
            isSent
              ? "You haven't nudged anyone yet. Find a teammate in your pod and send them a nudge!"
              : "No new notifications. When teammates reach out or you get matched, you'll see it here."
          }
          action={isSent ? { label: "Browse Pods", href: "/classes" } : undefined}
          variant="card"
        />
      );
    }

    return (
      <div className="space-y-3">
        {items.map((notification, idx) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card
              className={`hover:shadow-md transition-all cursor-pointer ${
                !isSent ? getNotificationBgClass(notification) : ''
              }`}
              onClick={() => !isSent && handleNotificationClick(notification)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notification.type === 'new_match' && !notification.read && !isSent
                        ? 'bg-accent/20'
                        : !notification.read && !isSent
                        ? 'bg-accent/20'
                        : 'bg-muted'
                    }`}>
                      {getNotificationIcon(notification, isSent)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base font-medium">
                          {getNotificationTitle(notification, isSent)}
                        </CardTitle>
                        {!notification.read && !isSent && (
                          <Badge variant="secondary" className={`text-xs ${
                            notification.type === 'new_match'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-accent/20 text-accent'
                          }`}>
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(notification.created_at)}
                        </p>
                        {notification.metadata?.pod_code && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {notification.metadata.pod_code}
                          </Badge>
                        )}
                        {/* Show response status for nudges */}
                        {notification.type === 'nudge' && notification.metadata?.responded && (
                          <Badge variant={notification.metadata.accepted ? "default" : "secondary"} className="text-xs">
                            {notification.metadata.accepted ? "Accepted" : "Declined"}
                          </Badge>
                        )}
                        {/* Show waiting indicator for sent nudges that haven't been responded to */}
                        {isSent && notification.type === 'nudge' && !notification.metadata?.responded && (
                          <Badge variant="outline" className="text-xs bg-warning/15 text-warning border-warning/30 animate-pulse">
                            Waiting for response...
                          </Badge>
                        )}
                      </div>

                      {/* Accept/Decline buttons for nudges that haven't been responded to */}
                      {!isSent && notification.type === 'nudge' && !notification.metadata?.responded && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleNudgeResponse(notification, true); }}
                            className="gap-1"
                          >
                            <CalendarBlank className="w-3 h-3" weight="duotone" />
                            Accept & Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); handleNudgeResponse(notification, false); }}
                          >
                            Not Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && !isSent && notification.type !== 'nudge' && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}>
                        Mark read
                      </Button>
                    )}
                    {!isSent && (
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                        <X className="h-4 w-4 text-muted-foreground" weight="duotone" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nudges & Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <Checks className="mr-2 h-4 w-4" weight="duotone" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="received">
        <TabsList className="w-full max-w-sm">
          <TabsTrigger value="received" className="flex items-center gap-2">Received</TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">Sent</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="pt-4">
          {renderList(notifications, false)}
        </TabsContent>
        <TabsContent value="sent" className="pt-4">
          {renderList(sentNotifications, true)}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
