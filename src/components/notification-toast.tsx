"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Zap, Sparkles, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
  notification: {
    id: string;
    type: string;
    content: string;
    metadata?: any;
  } | null;
  onDismiss: () => void;
  onAction?: () => void;
}

export function NotificationToast({ notification, onDismiss, onAction }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for exit animation
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const getIcon = () => {
    switch (notification?.type) {
      case 'nudge':
        return <Zap className="w-5 h-5 text-coffee-cortado" />;
      case 'nudge_response':
        return <MessageCircle className="w-5 h-5 text-coffee-mocha" />;
      case 'new_match':
        return <Sparkles className="w-5 h-5 text-coffee-oat" />;
      case 'meeting_invite':
        return <Calendar className="w-5 h-5 text-coffee-cortado" />;
      default:
        return <Bell className="w-5 h-5 text-coffee-cortado" />;
    }
  };

  const getTitle = () => {
    switch (notification?.type) {
      case 'nudge':
        return notification.metadata?.nudge_type === 'offer'
          ? "Someone wants to help!"
          : "Someone needs your help!";
      case 'nudge_response':
        return notification.metadata?.accepted
          ? "Nudge Accepted!"
          : "Nudge Response";
      case 'new_match':
        return "New Match Found!";
      case 'meeting_invite':
        return "Meeting Invitation";
      default:
        return "New Notification";
    }
  };

  const getAccentColor = () => {
    switch (notification?.type) {
      case 'nudge':
        return 'border-l-coffee-cortado bg-coffee-cortado/10';
      case 'nudge_response':
        return notification.metadata?.accepted
          ? 'border-l-coffee-mocha bg-coffee-mocha/10'
          : 'border-l-coffee-latte bg-coffee-latte/10';
      case 'new_match':
        return 'border-l-coffee-oat bg-coffee-oat/10';
      case 'meeting_invite':
        return 'border-l-coffee-cortado bg-coffee-cortado/10';
      default:
        return 'border-l-coffee-cortado bg-coffee-cortado/10';
    }
  };

  if (!notification) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          className="fixed top-4 right-4 z-[100] max-w-sm w-full"
        >
          <div className={cn(
            "rounded-xl border border-border/50 shadow-2xl backdrop-blur-xl",
            "bg-card/95 dark:bg-card/90",
            "border-l-4",
            getAccentColor()
          )}>
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-background/80 flex items-center justify-center shrink-0 ring-1 ring-border/50">
                  {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground text-sm">
                      {getTitle()}
                    </h4>
                    <button
                      onClick={handleDismiss}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.content}
                  </p>

                  {/* Action buttons for nudges */}
                  {notification.type === 'nudge' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          onAction?.();
                          handleDismiss();
                        }}
                      >
                        View & Respond
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={handleDismiss}
                      >
                        Later
                      </Button>
                    </div>
                  )}

                  {notification.type === 'nudge_response' && notification.metadata?.accepted && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          onAction?.();
                          handleDismiss();
                        }}
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Schedule Meeting
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
