"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getShortcutsList } from "@/hooks/useGlobalShortcuts";

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const shortcuts = getShortcutsList();

  useEffect(() => {
    const handleShowShortcuts = () => setOpen(true);
    window.addEventListener('show-shortcuts-dialog', handleShowShortcuts);
    return () => window.removeEventListener('show-shortcuts-dialog', handleShowShortcuts);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Navigate quickly with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
            >
              <span className="text-sm text-foreground">{shortcut.description}</span>
              <kbd className="kbd px-2 py-1 text-xs font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="kbd">Shift + ?</kbd> anytime to show this dialog
        </p>
      </DialogContent>
    </Dialog>
  );
}
