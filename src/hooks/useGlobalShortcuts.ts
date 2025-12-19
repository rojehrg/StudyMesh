"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useGlobalShortcuts() {
  const router = useRouter();

  const shortcuts: ShortcutConfig[] = [
    {
      key: "d",
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard"
    },
    {
      key: "p",
      action: () => router.push("/classes"),
      description: "Go to Pods"
    },
    {
      key: "m",
      action: () => router.push("/meetings"),
      description: "Go to Meetings"
    },
    {
      key: "s",
      action: () => router.push("/settings"),
      description: "Go to Settings"
    },
    {
      key: "n",
      action: () => router.push("/classes/create"),
      description: "Create new Pod"
    },
    {
      key: "j",
      action: () => router.push("/classes/join"),
      description: "Join a Pod"
    },
    {
      key: "?",
      shiftKey: true,
      action: () => {
        // Dispatch custom event to show shortcuts dialog
        window.dispatchEvent(new CustomEvent('show-shortcuts-dialog'));
      },
      description: "Show keyboard shortcuts"
    }
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Don't trigger if a modifier we don't expect is pressed
    if (event.metaKey) return;

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                         (shortcut.key === "?" && event.key === "?");
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Component to display available shortcuts
export function getShortcutsList() {
  return [
    { key: "D", description: "Dashboard" },
    { key: "P", description: "Pods" },
    { key: "M", description: "Meetings" },
    { key: "S", description: "Settings" },
    { key: "N", description: "Create Pod" },
    { key: "J", description: "Join Pod" },
    { key: "Shift + ?", description: "Show shortcuts" },
  ];
}
