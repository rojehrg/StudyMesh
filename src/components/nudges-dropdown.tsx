"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, Check, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  content: string;
  type: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

export function NudgesDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();

    // Set up realtime subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
  const displayedNotifications = activeTab === 'received' ? notifications : sentNotifications;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center px-1.5 shadow-sm">
              {unreadCount > 9 ? '9+' : unreadCount}
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
                    </div>
                  </div>
                  {!notification.read && activeTab === 'received' && (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
