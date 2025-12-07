"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["D"], description: "Go to Dashboard" },
  { keys: ["P"], description: "Go to Pods" },
  { keys: ["W"], description: "Go to Working Circles" },
  { keys: ["S"], description: "Go to Settings" },
  { keys: ["N"], description: "Create New Pod" },
  { keys: ["J"], description: "Join Pod" },
  { keys: ["/"], description: "Focus search" },
  { keys: ["Shift", "?"], description: "Show this help" },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setOpen((prev) => !prev);
    window.addEventListener("toggle-shortcuts-help", handleToggle);
    return () =>
      window.removeEventListener("toggle-shortcuts-help", handleToggle);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Navigate faster with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">Shift</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">?</kbd> anytime to show this help
        </p>
      </DialogContent>
    </Dialog>
  );
}
