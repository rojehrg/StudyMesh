"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, Send, X, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/components/realtime-provider";

interface Notification {
  id: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
  metadata?: any;
  sender_id?: string;
}

export function NudgesDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Use realtime context for live updates
  const { newNotificationCount, clearNotificationCount } = useRealtime();

  useEffect(() => {
    loadNotifications();
  }, []);

  // Reload when new notification comes in via realtime
  useEffect(() => {
    if (newNotificationCount > 0) {
      loadNotifications();
    }
  }, [newNotificationCount]);

  // Clear count when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      clearNotificationCount();
    }
  }, [isOpen, clearNotificationCount]);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [received, sent] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('notifications')
          .select('*')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      setNotifications(received.data || []);
      setSentNotifications(sent.data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      console.error("Error marking all as read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);

      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, read: true } : n
      ));
    }

    if (notification.metadata?.pod_code) {
      router.push(`/classes/${notification.metadata.pod_code}`);
    }
  };

  const handleNudgeResponse = async (notification: Notification, accepted: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
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

      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();

        const senderName = profile ? `${profile.first_name} ${profile.last_name}` : 'Someone';

        // Send response notification to original sender
        const originalSenderId = (notification as any).sender_id;
        if (originalSenderId) {
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

          // Send Slack/email notification
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

      toast.success(accepted ? "Nudge accepted!" : "Response sent");

      // If accepted, navigate to pod to schedule
      if (accepted && metadata.pod_code) {
        setIsOpen(false);
        const originalSenderId = (notification as any).sender_id;
        router.push(`/classes/${metadata.pod_code}?schedule=${originalSenderId}`);
      }
    } catch (error) {
      console.error("Error responding to nudge:", error);
      toast.error("Failed to respond");
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  // Show realtime count as a pulse indicator, plus unread from DB
  const totalUnread = unreadCount + newNotificationCount;
  const displayedNotifications = activeTab === 'received' ? notifications : sentNotifications;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" onClick={(e) => e.stopPropagation()}>
          <Bell className={cn(
            "w-5 h-5 text-foreground transition-transform",
            newNotificationCount > 0 && "animate-[wiggle_0.5s_ease-in-out]"
          )} />
          {totalUnread > 0 && (
            <span className={cn(
              "absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-sm transition-all",
              newNotificationCount > 0 && "animate-pulse ring-2 ring-primary/50"
            )}>
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Nudges</h3>
            {unreadCount > 0 && activeTab === 'received' && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('received')}
              className={cn(
                "flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-colors",
                activeTab === 'received'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Received
              {unreadCount > 0 && (
                <span className="ml-1.5 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={cn(
                "flex-1 text-sm font-medium py-1.5 px-3 rounded-md transition-colors",
                activeTab === 'sent'
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sent
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-sm">Loading...</div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                {activeTab === 'received' ? (
                  <Bell className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Send className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {activeTab === 'received' ? "No nudges yet" : "No sent nudges"}
              </p>
            </div>
          ) : (
            displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => activeTab === 'received' && handleNotificationClick(notification)}
                className={cn(
                  "p-3 border-b border-border/50 last:border-0 transition-colors",
                  activeTab === 'received' && "cursor-pointer hover:bg-accent",
                  !notification.read && activeTab === 'received' && "bg-primary/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    !notification.read && activeTab === 'received'
                      ? "bg-primary/10"
                      : "bg-muted"
                  )}>
                    {activeTab === 'sent' ? (
                      <Send className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Bell className={cn(
                        "w-4 h-4",
                        !notification.read ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(notification.created_at)}
                      </span>
                      {notification.metadata?.pod_code && (
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">
                          {notification.metadata.pod_code}
                        </span>
                      )}
                      {notification.type === 'nudge' && notification.metadata?.responded && (
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          notification.metadata.accepted
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {notification.metadata.accepted ? "Accepted" : "Declined"}
                        </span>
                      )}
                      {/* Show waiting indicator for sent nudges that haven't been responded to */}
                      {activeTab === 'sent' && notification.type === 'nudge' && !notification.metadata?.responded && (
                        <span className="text-xs bg-warning/15 text-warning px-1.5 py-0.5 rounded animate-pulse">
                          Waiting...
                        </span>
                      )}
                    </div>
                    {/* Accept/Decline buttons for nudges */}
                    {activeTab === 'received' && notification.type === 'nudge' && !notification.metadata?.responded && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={(e) => handleNudgeResponse(notification, true, e)}
                          className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-md hover:bg-primary/90 transition-colors"
                        >
                          <Calendar className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleNudgeResponse(notification, false, e)}
                          className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
                        >
                          Not Now
                        </button>
                      </div>
                    )}
                  </div>
                  {!notification.read && activeTab === 'received' && notification.type !== 'nudge' && (
                    <button
                      onClick={(e) => markAsRead(notification.id, e)}
                      className="text-muted-foreground hover:text-primary p-1"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* View all link */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => { setIsOpen(false); router.push('/notifications'); }}
            className="w-full text-sm text-primary hover:text-primary/80 font-medium py-1.5"
          >
            View all notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
