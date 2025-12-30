"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Loader2,
  HelpCircle,
  Lightbulb,
  Clock,
  Calendar,
  MessageSquare,
  Zap,
  CheckCircle2,
  Slack,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  suggestMeetingTimes,
  formatSuggestedTime,
  getTimeUntilNextAvailable,
} from "@/lib/availability";

interface AvailabilitySlot {
  day: number;
  startSlot: number;
  endSlot: number;
}

interface NudgeDialogProps {
  open: boolean;
  onClose: () => void;
  member: {
    userId: string;
    name: string;
    knowledgeAreas?: string[];
    expertiseSkills?: string[]; // Legacy support
    timezone?: string;
    availabilitySlots?: AvailabilitySlot[];
    currentlyAvailable?: boolean;
    slackConnected?: boolean;
  };
  currentUser: {
    userId: string;
    knowledgeAreas?: string[];
    expertiseSkills?: string[]; // Legacy support
    timezone?: string;
    availabilitySlots?: AvailabilitySlot[];
  };
  onNudge: (data: {
    recipientId: string;
    topic: string;
    type: "ask" | "offer";
    meetingLength: "15min" | "30min" | "1hr" | "async";
    suggestedTime?: string;
    message: string;
  }) => Promise<void>;
  onSuccess?: () => void; // Callback for celebration
  isFirstNudge?: boolean; // Show extra celebration for first nudge
}

const MEETING_LENGTHS = [
  {
    value: "15min" as const,
    label: "Quick question",
    duration: "15 min",
    icon: Zap,
    description: "Fast sync, simple question",
  },
  {
    value: "30min" as const,
    label: "Standard call",
    duration: "30 min",
    icon: Clock,
    description: "Most common for help sessions",
  },
  {
    value: "1hr" as const,
    label: "Deep dive",
    duration: "1 hour",
    icon: Calendar,
    description: "Complex topics, pair programming",
  },
  {
    value: "async" as const,
    label: "Async",
    duration: "Slack thread",
    icon: MessageSquare,
    description: "No call needed, just a message",
  },
];

// Quick nudge templates
const NUDGE_TEMPLATES = {
  ask: [
    { label: "Quick 15-min chat", topic: "Quick question about", meetingLength: "15min" as const },
    { label: "Code review", topic: "Code review request for", meetingLength: "30min" as const },
    { label: "Pair programming", topic: "Pair programming session on", meetingLength: "1hr" as const },
    { label: "Async question", topic: "Quick async question about", meetingLength: "async" as const },
  ],
  offer: [
    { label: "Office hours", topic: "I have time to help with", meetingLength: "30min" as const },
    { label: "Quick tip", topic: "Quick tip about", meetingLength: "15min" as const },
    { label: "Deep dive session", topic: "I can walk you through", meetingLength: "1hr" as const },
    { label: "Async help", topic: "Happy to help async with", meetingLength: "async" as const },
  ],
};

export function NudgeDialog({
  open,
  onClose,
  member,
  currentUser,
  onNudge,
  onSuccess,
  isFirstNudge,
}: NudgeDialogProps) {
  const [nudgeType, setNudgeType] = useState<"ask" | "offer">("ask");
  const [topic, setTopic] = useState("");
  const [meetingLength, setMeetingLength] = useState<"15min" | "30min" | "1hr" | "async">("30min");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Get knowledge areas (support both new and legacy format)
  const memberKnowledge = member.knowledgeAreas || member.expertiseSkills || [];
  const currentUserKnowledge = currentUser.knowledgeAreas || currentUser.expertiseSkills || [];

  // Calculate suggested meeting times
  const suggestedTimes = suggestMeetingTimes(
    {
      userId: currentUser.userId,
      timezone: currentUser.timezone || "America/New_York",
      slots: currentUser.availabilitySlots || [],
      currentlyAvailable: false,
    },
    {
      userId: member.userId,
      timezone: member.timezone || "America/New_York",
      slots: member.availabilitySlots || [],
      currentlyAvailable: member.currentlyAvailable || false,
    },
    meetingLength === "async" ? 30 : meetingLength === "15min" ? 15 : meetingLength === "30min" ? 30 : 60
  );

  // Get availability status
  const availabilityStatus = member.currentlyAvailable
    ? "Available now"
    : getTimeUntilNextAvailable({
        userId: member.userId,
        timezone: member.timezone || "America/New_York",
        slots: member.availabilitySlots || [],
        currentlyAvailable: false,
      });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNudgeType("ask");
      setTopic("");
      setMeetingLength("30min");
      setSelectedTime("");
      setAdditionalMessage("");
    }
  }, [open]);

  // Generate the preview message
  const generateMessage = () => {
    const typeText = nudgeType === "ask" ? "need help with" : "can help you with";
    const timeText = selectedTime ? `\n\nSuggested time: ${selectedTime}` : "";
    const durationText = meetingLength === "async" ? "" : ` (${MEETING_LENGTHS.find((m) => m.value === meetingLength)?.duration})`;
    const additionalText = additionalMessage ? `\n\n${additionalMessage}` : "";

    return `Hey! I ${typeText} "${topic}"${durationText}.${timeText}${additionalText}`;
  };

  const handleSubmit = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    try {
      await onNudge({
        recipientId: member.userId,
        topic: topic.trim(),
        type: nudgeType,
        meetingLength,
        suggestedTime: selectedTime || undefined,
        message: generateMessage(),
      });
      onClose();
      // Trigger celebration callback
      onSuccess?.();
    } catch (error) {
      console.error("Error sending nudge:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Nudge {member.name}
            {member.currentlyAvailable && (
              <Badge className="bg-success/10 text-success border-0 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Available now
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Send a contextual request to connect and collaborate
            {member.slackConnected && (
              <span className="flex items-center gap-1 mt-1 text-xs">
                <Slack className="w-3 h-3" />
                Will be delivered via Slack DM
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Templates */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quick Start</Label>
            <div className="flex flex-wrap gap-2">
              {NUDGE_TEMPLATES[nudgeType].map((template) => (
                <Button
                  key={template.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setTopic(template.topic);
                    setMeetingLength(template.meetingLength);
                  }}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Nudge Type Selection */}
          <div className="space-y-3">
            <Label>What would you like to do?</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNudgeType("ask")}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  nudgeType === "ask"
                    ? "border-primary/50 bg-primary/10"
                    : "border-border hover:border-primary/30 hover:bg-muted"
                )}
              >
                <HelpCircle
                  className={cn(
                    "w-5 h-5 mb-2",
                    nudgeType === "ask" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    nudgeType === "ask" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Ask for Help
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Request their expertise
                </p>
              </button>

              <button
                type="button"
                onClick={() => setNudgeType("offer")}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  nudgeType === "offer"
                    ? "border-accent/50 bg-accent/10"
                    : "border-border hover:border-accent/30 hover:bg-muted"
                )}
              >
                <Lightbulb
                  className={cn(
                    "w-5 h-5 mb-2",
                    nudgeType === "offer" ? "text-accent" : "text-muted-foreground"
                  )}
                />
                <p
                  className={cn(
                    "text-sm font-medium",
                    nudgeType === "offer" ? "text-accent" : "text-muted-foreground"
                  )}
                >
                  Offer Help
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Share your knowledge
                </p>
              </button>
            </div>
          </div>

          {/* Topic Input - Now freeform with suggestions */}
          <div className="space-y-3">
            <Label htmlFor="topic">
              {nudgeType === "ask" ? "What do you need help with?" : "What can you help with?"}
            </Label>
            <Input
              id="topic"
              placeholder={
                nudgeType === "ask"
                  ? "e.g., Setting up Salesforce API integration"
                  : "e.g., I can help with SQL debugging"
              }
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />

            {/* Quick suggestion chips based on knowledge areas */}
            {(nudgeType === "ask" ? memberKnowledge : currentUserKnowledge).length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Suggestions:</span>
                {(nudgeType === "ask" ? memberKnowledge : currentUserKnowledge)
                  .slice(0, 4)
                  .map((area) => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => setTopic(area)}
                    >
                      {area}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Meeting Length Selection */}
          <div className="space-y-3">
            <Label>How much time do you need?</Label>
            <RadioGroup
              value={meetingLength}
              onValueChange={(v) => {
                setMeetingLength(v as typeof meetingLength);
                setSelectedTime(""); // Reset selected time when length changes
              }}
              className="grid grid-cols-2 gap-2"
            >
              {MEETING_LENGTHS.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                      "hover:bg-muted"
                    )}
                  >
                    <option.icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.duration}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Suggested Times (only for non-async) */}
          {meetingLength !== "async" && suggestedTimes.length > 0 && (
            <div className="space-y-3">
              <Label>Suggested times (based on availability overlap)</Label>
              <div className="space-y-2">
                {suggestedTimes.map((time, index) => {
                  const timeString = formatSuggestedTime(time);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() =>
                        setSelectedTime(selectedTime === timeString ? "" : timeString)
                      }
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        selectedTime === timeString
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-muted"
                      )}
                    >
                      {selectedTime === timeString ? (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm">{timeString}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* No overlap warning */}
          {meetingLength !== "async" && suggestedTimes.length === 0 && (
            <div className="p-3 rounded-lg bg-muted border border-border text-sm">
              <p className="font-medium text-muted-foreground">No overlapping availability found</p>
              <p className="text-muted-foreground text-xs mt-1">
                {availabilityStatus || "Consider async communication or check back later."}
              </p>
            </div>
          )}

          {/* Additional Message */}
          <div className="space-y-3">
            <Label htmlFor="message">Additional context (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add any context that would help..."
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Message Preview */}
          {topic.trim() && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Message Preview</Label>
              <div
                className={cn(
                  "p-4 rounded-xl border-2",
                  nudgeType === "ask"
                    ? "bg-primary/5 border-primary/20"
                    : "bg-accent/5 border-accent/20"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{generateMessage()}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!topic.trim() || loading}
            className={cn(
              nudgeType === "ask"
                ? "bg-primary hover:bg-primary/90"
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
            )}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : member.slackConnected ? (
              <Slack className="mr-2 h-4 w-4" />
            ) : null}
            Send Nudge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Legacy export for backward compatibility
export default NudgeDialog;
