"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Bell, CheckCheck, X, Loader2, Send, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
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
    } else if (metadata.pod_code) {
      router.push(`/classes/${metadata.pod_code}`);
    }
  };

  const getNotificationIcon = (notification: any, isSent: boolean) => {
    if (isSent) {
      return <Send className="w-5 h-5 text-gray-500" />;
    }
    if (notification.type === 'new_match') {
      return <Sparkles className={`w-5 h-5 ${!notification.read ? 'text-sand-500' : 'text-gray-400'}`} />;
    }
    return <Bell className={`w-5 h-5 ${!notification.read ? 'text-terra-400' : 'text-gray-400'}`} />;
  };

  const getNotificationTitle = (notification: any, isSent: boolean) => {
    if (notification.type === 'new_match') {
      return '✨ New Match Found';
    }
    if (notification.type === 'nudge') {
      return isSent ? '👋 Nudge Sent' : '👋 Nudge Received';
    }
    return 'Notification';
  };

  const getNotificationBgClass = (notification: any) => {
    if (notification.type === 'new_match' && !notification.read) {
      return 'border-l-4 border-l-sand-400 bg-sand-100/50';
    }
    if (!notification.read) {
      return 'border-l-4 border-l-terra-400 bg-terra-50/30';
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
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-terra-400" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderList = (items: any[], isSent: boolean) => {
    if (items.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">{isSent ? "No sent nudges" : "No notifications yet"}</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {isSent ? "You haven't nudged anyone yet." : "When teammates nudge you or you get matched in pods, you'll see notifications here."}
            </p>
          </CardContent>
        </Card>
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
                        ? 'bg-sand-100'
                        : !notification.read && !isSent
                        ? 'bg-terra-100'
                        : 'bg-gray-100'
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
                              ? 'bg-sand-100 text-sand-600'
                              : 'bg-terra-100 text-terra-500'
                          }`}>
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">
                        {notification.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-400">
                          {getTimeAgo(notification.created_at)}
                        </p>
                        {notification.metadata?.pod_code && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {notification.metadata.pod_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && !isSent && (
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}>
                        Mark read
                      </Button>
                    )}
                    {!isSent && (
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}>
                        <X className="h-4 w-4 text-gray-400" />
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
          <h1 className="text-2xl font-bold text-gray-900">Nudges & Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
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

