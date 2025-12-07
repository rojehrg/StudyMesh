"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const ctrlOrMeta = shortcut.ctrl || shortcut.meta;
        const isCtrlOrMetaPressed = event.ctrlKey || event.metaKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          (!ctrlOrMeta || isCtrlOrMetaPressed) &&
          (!shortcut.shift || event.shiftKey)
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function useGlobalShortcuts() {
  const router = useRouter();

  const shortcuts: ShortcutConfig[] = [
    {
      key: "d",
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "p",
      action: () => router.push("/classes"),
      description: "Go to Pods",
    },
    {
      key: "w",
      action: () => router.push("/groups"),
      description: "Go to Working Circles",
    },
    {
      key: "s",
      action: () => router.push("/settings"),
      description: "Go to Settings",
    },
    {
      key: "n",
      action: () => router.push("/classes/create"),
      description: "Create New Pod",
    },
    {
      key: "j",
      action: () => router.push("/classes/join"),
      description: "Join Pod",
    },
    {
      key: "/",
      action: () => {
        // Focus search input if exists
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search"]'
        );
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: "Focus search",
    },
    {
      key: "?",
      shift: true,
      action: () => {
        // Toggle keyboard shortcuts help
        const event = new CustomEvent("toggle-shortcuts-help");
        window.dispatchEvent(event);
      },
      description: "Show keyboard shortcuts",
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
