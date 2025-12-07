"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, HelpCircle, Lightbulb } from "lucide-react";

interface NudgeDialogProps {
  open: boolean;
  onClose: () => void;
  member: {
    userId: string;
    name: string;
    expertiseSkills: string[];
  };
  currentUserExpertise: string[];
  onNudge: (recipientId: string, topic: string, type: 'ask' | 'offer') => Promise<void>;
}

export function NudgeDialog({ open, onClose, member, currentUserExpertise, onNudge }: NudgeDialogProps) {
  const [nudgeType, setNudgeType] = useState<'ask' | 'offer'>('ask');
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const availableTopics = nudgeType === 'ask' ? member.expertiseSkills : currentUserExpertise;

  const handleSubmit = async () => {
    if (!selectedTopic) return;
    
    setLoading(true);
    try {
      await onNudge(member.userId, selectedTopic, nudgeType);
      onClose();
    } catch (error) {
      console.error("Error sending nudge:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nudge {member.name}</DialogTitle>
          <DialogDescription>
            Send a contextual nudge to connect and collaborate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nudge Type Selection */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setNudgeType('ask');
                  setSelectedTopic("");
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  nudgeType === 'ask'
                    ? 'border-cyan-500/50 dark:border-cyan-400/50 bg-cyan-500/10 dark:bg-cyan-400/10'
                    : 'border-border hover:border-cyan-500/30 hover:bg-accent'
                }`}
              >
                <HelpCircle className={`w-6 h-6 mx-auto mb-2 ${
                  nudgeType === 'ask' ? 'text-cyan-600 dark:text-cyan-400' : 'text-muted-foreground'
                }`} />
                <p className={`text-sm font-medium ${
                  nudgeType === 'ask' ? 'text-cyan-700 dark:text-cyan-300' : 'text-muted-foreground'
                }`}>
                  Ask for Help
                </p>
              </button>

              <button
                onClick={() => {
                  setNudgeType('offer');
                  setSelectedTopic("");
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  nudgeType === 'offer'
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border hover:border-primary/30 hover:bg-accent'
                }`}
              >
                <Lightbulb className={`w-6 h-6 mx-auto mb-2 ${
                  nudgeType === 'offer' ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className={`text-sm font-medium ${
                  nudgeType === 'offer' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  Offer Help
                </p>
              </button>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-3">
            <Label>
              {nudgeType === 'ask' ? 'What do you need help with?' : 'What can you help with?'}
            </Label>
            
            {availableTopics.length > 0 ? (
              <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTopics.map(topic => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-4 bg-muted/50 rounded-xl border border-dashed text-center">
                <p className="text-sm text-muted-foreground">
                  {nudgeType === 'ask' 
                    ? "This member hasn't listed any expertise skills yet"
                    : "Add expertise skills in Settings to offer help"}
                </p>
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedTopic && (
            <div className={`p-4 rounded-xl border-2 ${
              nudgeType === 'ask' ? 'bg-cyan-500/10 dark:bg-cyan-400/10 border-cyan-500/30 dark:border-cyan-400/30' : 'bg-primary/10 border-primary/30'
            }`}>
              <p className="text-sm font-medium text-foreground mb-1">Message Preview:</p>
              <p className="text-sm text-foreground">
                {nudgeType === 'ask' 
                  ? `"Can you help me with ${selectedTopic}?"`
                  : `"I can help you with ${selectedTopic}!"`
                }
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedTopic || loading}
            className={nudgeType === 'ask' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-teal-600 hover:bg-teal-700'}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Nudge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

