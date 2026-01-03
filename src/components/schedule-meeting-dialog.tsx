"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, Clock, Video, Search, Check, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type MeetingProvider = 'zoom' | 'google' | 'custom';

interface ConnectedProviders {
  zoom: boolean;
  google: boolean;
  zoomEmail?: string;
  googleEmail?: string;
}

interface Pod {
  id: string;
  pod_name: string;
  pod_code: string;
}

interface PodMember {
  user_id: string;
  first_name?: string;
  last_name?: string;
  department?: string;
}

interface AvailabilitySlot {
  start: string;
  end: string;
}

interface ScheduleMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedPodId?: string;
  preselectedUserIds?: string[];
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  onSuccess,
  preselectedPodId,
  preselectedUserIds = []
}: ScheduleMeetingDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pods, setPods] = useState<Pod[]>([]);
  const [selectedPod, setSelectedPod] = useState<string | null>(preselectedPodId || null);
  const [podMembers, setPodMembers] = useState<PodMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(preselectedUserIds);
  const [overlap, setOverlap] = useState<Record<number, { slots: AvailabilitySlot[] }>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Meeting details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("30");
  const [meetingLink, setMeetingLink] = useState("");
  const [useManualTime, setUseManualTime] = useState(false);
  const [manualTime, setManualTime] = useState("");

  // Meeting provider
  const [selectedProvider, setSelectedProvider] = useState<MeetingProvider>('custom');
  const [connectedProviders, setConnectedProviders] = useState<ConnectedProviders>({ zoom: false, google: false });
  const [loadingProviders, setLoadingProviders] = useState(false);

  const supabase = createClient();

  // Day names matching availability format: 0=Monday, 6=Sunday
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (open) {
      loadPods();
      loadConnectedProviders();
      setStep(1);
      resetForm();
    }
  }, [open]);

  const loadConnectedProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await fetch('/api/user/providers');
      const data = await response.json();
      if (data.success) {
        setConnectedProviders(data.providers);
        // Default to first connected provider if any
        if (data.providers.zoom) {
          setSelectedProvider('zoom');
        } else if (data.providers.google) {
          setSelectedProvider('google');
        } else {
          setSelectedProvider('custom');
        }
      }
    } catch (error) {
      console.error("Error loading providers:", error);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    if (selectedPod) {
      loadPodMembers(selectedPod);
    }
  }, [selectedPod]);

  useEffect(() => {
    if (selectedMembers.length > 0) {
      findOverlap();
    } else {
      setOverlap({});
    }
  }, [selectedMembers]);

  const resetForm = () => {
    setSelectedPod(preselectedPodId || null);
    setSelectedMembers(preselectedUserIds);
    setTitle("");
    setDescription("");
    setSelectedDay(null);
    setSelectedTime("");
    setDuration("30");
    setMeetingLink("");
    setOverlap({});
    setUseManualTime(false);
    setManualTime("");
    // Provider will be set by loadConnectedProviders
  };

  const loadPods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get pods where user is a member
      const { data: memberOf } = await supabase
        .from('pod_members')
        .select('pod_id')
        .eq('user_id', user.id);

      if (!memberOf?.length) return;

      const podIds = memberOf.map(m => m.pod_id);
      const { data: podData } = await supabase
        .from('pods')
        .select('id, pod_name, pod_code')
        .in('id', podIds);

      setPods(podData || []);
    } catch (error) {
      console.error("Error loading pods:", error);
    }
  };

  const loadPodMembers = async (podId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: members } = await supabase
        .from('pod_members')
        .select('user_id')
        .eq('pod_id', podId);

      if (!members) return;

      // Get profiles for all members except current user
      const memberIds = members.map(m => m.user_id).filter(id => id !== user.id);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, department')
        .in('user_id', memberIds);

      setPodMembers(profiles || []);
    } catch (error) {
      console.error("Error loading pod members:", error);
    }
  };

  const findOverlap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Include current user in overlap calculation
      const allUserIds = [...selectedMembers, user.id];

      const response = await fetch('/api/availability/overlap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: allUserIds,
          durationMinutes: parseInt(duration)
        })
      });

      const data = await response.json();
      if (data.success) {
        setOverlap(data.overlap);
      }
    } catch (error) {
      console.error("Error finding overlap:", error);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSchedule = async () => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    if (selectedMembers.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    if (selectedDay === null || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    setLoading(true);

    try {
      // Calculate the next occurrence of the selected day
      // selectedDay is in Mon=0 format, but JS getDay() uses Sun=0
      // Convert: Mon(0) -> 1, Tue(1) -> 2, ..., Sun(6) -> 0
      const now = new Date();
      const todayJsDay = now.getDay(); // 0=Sun, 1=Mon, ...
      const targetJsDay = (selectedDay + 1) % 7; // Convert from Mon=0 to Sun=0 format
      let daysUntil = targetJsDay - todayJsDay;
      if (daysUntil <= 0) daysUntil += 7; // Next week if today or past

      const meetingDate = new Date(now);
      meetingDate.setDate(now.getDate() + daysUntil);

      // Set the time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      meetingDate.setHours(hours, minutes, 0, 0);

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          scheduledTime: meetingDate.toISOString(),
          durationMinutes: parseInt(duration),
          meetingLink: selectedProvider === 'custom' ? (meetingLink || null) : null,
          participantIds: selectedMembers,
          podId: selectedPod,
          provider: selectedProvider
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Meeting scheduled!", {
          description: `Notifications sent to ${selectedMembers.length} participant(s)`
        });
        onSuccess();
      } else {
        toast.error(data.error || "Failed to schedule meeting");
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast.error("Failed to schedule meeting");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = podMembers.filter(member => {
    if (!searchQuery) return true;
    const name = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const hasOverlap = Object.values(overlap).some(day => day.slots.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Meeting</DialogTitle>
          <DialogDescription>
            {step === 1 && "Select participants for your meeting"}
            {step === 2 && "Choose a time when everyone is available"}
            {step === 3 && "Add meeting details"}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? 'bg-primary text-primary-foreground'
                  : step > s
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Pod Selection */}
              <div className="space-y-2">
                <Label>Select Pod</Label>
                <Select value={selectedPod || ""} onValueChange={setSelectedPod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pod" />
                  </SelectTrigger>
                  <SelectContent>
                    {pods.map((pod) => (
                      <SelectItem key={pod.id} value={pod.id}>
                        {pod.pod_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Member Selection */}
              {selectedPod && (
                <>
                  <div className="space-y-2">
                    <Label>Select Participants ({selectedMembers.length} selected)</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="max-h-[300px] overflow-y-auto space-y-2 p-1">
                    {filteredMembers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No members found
                      </p>
                    ) : (
                      filteredMembers.map((member) => (
                        <div
                          key={member.user_id}
                          onClick={() => toggleMember(member.user_id)}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedMembers.includes(member.user_id)
                              ? 'bg-primary/10'
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          <Checkbox
                            checked={selectedMembers.includes(member.user_id)}
                            onCheckedChange={() => toggleMember(member.user_id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {member.first_name} {member.last_name}
                            </p>
                            {member.department && (
                              <p className="text-sm text-muted-foreground">{member.department}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Duration Selection */}
              <div className="space-y-2">
                <Label>Meeting Duration</Label>
                <Select value={duration} onValueChange={(v) => { setDuration(v); setSelectedTime(""); }}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Available Slots */}
              <div className="space-y-2">
                <Label>Available Times</Label>
                {!hasOverlap ? (
                  <div className="space-y-4">
                    <div className="text-center py-6 bg-muted/30 rounded-xl">
                      <Calendar className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No overlapping availability found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You can still pick a manual time below
                      </p>
                    </div>

                    {/* Manual time picker */}
                    <div className="p-4 border border-dashed rounded-lg space-y-3">
                      <Label className="text-sm font-medium">Pick a manual time</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Day</Label>
                          <Select
                            value={selectedDay !== null ? String(selectedDay) : ""}
                            onValueChange={(v) => { setSelectedDay(parseInt(v)); setUseManualTime(true); }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {dayNames.map((day, idx) => (
                                <SelectItem key={idx} value={String(idx)}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                          <Input
                            type="time"
                            value={manualTime}
                            onChange={(e) => { setManualTime(e.target.value); setSelectedTime(e.target.value); setUseManualTime(true); }}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayNames.map((dayName, dayIndex) => {
                      const daySlots = overlap[dayIndex]?.slots || [];
                      if (daySlots.length === 0) return null;

                      return (
                        <div key={dayIndex} className="space-y-2">
                          <p className="text-sm font-medium text-foreground">{dayName}</p>
                          <div className="flex flex-wrap gap-2">
                            {daySlots.map((slot, idx) => {
                              const isSelected = selectedDay === dayIndex && selectedTime === slot.start && !useManualTime;
                              return (
                                <Button
                                  key={idx}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    setSelectedDay(dayIndex);
                                    setSelectedTime(slot.start);
                                    setUseManualTime(false);
                                  }}
                                  className="gap-1"
                                >
                                  <Clock className="w-3 h-3" />
                                  {slot.start} - {slot.end}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Manual time alternative */}
                    <div className="pt-3 border-t">
                      <button
                        type="button"
                        onClick={() => setUseManualTime(!useManualTime)}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" />
                        {useManualTime ? "Use suggested times" : "Or pick a different time"}
                      </button>

                      {useManualTime && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Day</Label>
                            <Select
                              value={selectedDay !== null ? String(selectedDay) : ""}
                              onValueChange={(v) => setSelectedDay(parseInt(v))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent>
                                {dayNames.map((day, idx) => (
                                  <SelectItem key={idx} value={String(idx)}>{day}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
                            <Input
                              type="time"
                              value={manualTime}
                              onChange={(e) => { setManualTime(e.target.value); setSelectedTime(e.target.value); }}
                              className="h-10"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedDay !== null && selectedTime && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary font-medium">
                    Selected: {dayNames[selectedDay]} at {selectedTime} ({duration} min)
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Weekly Sync, Product Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What's this meeting about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Meeting Provider Selection */}
              <div className="space-y-3">
                <Label>Video Platform</Label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Zoom Option */}
                  <button
                    type="button"
                    onClick={() => connectedProviders.zoom && setSelectedProvider('zoom')}
                    disabled={!connectedProviders.zoom}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      selectedProvider === 'zoom'
                        ? 'border-primary bg-primary/5'
                        : connectedProviders.zoom
                        ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                        : 'border-border/50 bg-muted/30 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">Zoom</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {connectedProviders.zoom
                            ? connectedProviders.zoomEmail || 'Connected'
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {selectedProvider === 'zoom' && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </button>

                  {/* Google Meet Option */}
                  <button
                    type="button"
                    onClick={() => connectedProviders.google && setSelectedProvider('google')}
                    disabled={!connectedProviders.google}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      selectedProvider === 'google'
                        ? 'border-primary bg-primary/5'
                        : connectedProviders.google
                        ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                        : 'border-border/50 bg-muted/30 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">Google Meet</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {connectedProviders.google
                            ? connectedProviders.googleEmail || 'Connected'
                            : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {selectedProvider === 'google' && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </button>

                  {/* Custom Link Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedProvider('custom')}
                    className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                      selectedProvider === 'custom'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                        <Link2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">Custom</p>
                        <p className="text-xs text-muted-foreground">Paste your link</p>
                      </div>
                    </div>
                    {selectedProvider === 'custom' && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Info text based on selection */}
                {selectedProvider !== 'custom' && (
                  <p className="text-xs text-muted-foreground">
                    A {selectedProvider === 'zoom' ? 'Zoom' : 'Google Meet'} link will be created automatically
                  </p>
                )}

                {(!connectedProviders.zoom || !connectedProviders.google) && (
                  <p className="text-xs text-muted-foreground">
                    Connect Zoom or Google in{' '}
                    <a href="/settings" className="text-primary hover:underline">Settings</a>
                    {' '}for auto-generated links
                  </p>
                )}
              </div>

              {/* Custom Meeting Link - only show when custom provider selected */}
              {selectedProvider === 'custom' && (
                <div className="space-y-2">
                  <Label htmlFor="link">Meeting Link (optional)</Label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="link"
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="font-medium text-foreground">Meeting Summary</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>When:</strong> {selectedDay !== null ? dayNames[selectedDay] : ''} at {selectedTime} ({duration} min)</p>
                  <p><strong>Participants:</strong> {selectedMembers.length} people</p>
                  {selectedPod && (
                    <p><strong>Pod:</strong> {pods.find(p => p.id === selectedPod)?.pod_name}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && selectedMembers.length === 0) ||
                (step === 2 && (selectedDay === null || !selectedTime))
              }
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleSchedule} disabled={loading || !title.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Meeting
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
