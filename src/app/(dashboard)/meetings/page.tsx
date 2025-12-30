"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Plus,
  Check,
  X,
  ChevronRight,
  Loader2,
  CalendarDays
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ScheduleMeetingDialog } from "@/components/schedule-meeting-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageLoader } from "@/components/loading-states";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduled_time: string;
  duration_minutes: number;
  meeting_link?: string;
  status: string;
  role: 'organizer' | 'participant';
  myRsvp?: string;
  organizer?: {
    first_name?: string;
    last_name?: string;
  };
  participants?: Array<{
    user_id: string;
    rsvp_status: string;
    profile?: {
      first_name?: string;
      last_name?: string;
    };
  }>;
  podName?: string;
}

export default function MeetingsPage() {
  const [loading, setLoading] = useState(true);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [pastMeetings, setPastMeetings] = useState<Meeting[]>([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await fetch('/api/meetings');
      const data = await response.json();

      if (data.success) {
        setUpcomingMeetings(data.upcoming || []);
        setPastMeetings(data.past || []);
      }
    } catch (error) {
      console.error("Error loading meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (meetingId: string, status: 'accepted' | 'declined') => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(status === 'accepted' ? 'Meeting accepted!' : 'Meeting declined');
        loadMeetings();
      } else {
        toast.error('Failed to update RSVP');
      }
    } catch (error) {
      toast.error('Failed to update RSVP');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const tzAbbrev = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short'
    }).formatToParts(date).find(p => p.type === 'timeZoneName')?.value || '';

    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }),
      timezone: tzAbbrev,
      full: date.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  };

  const getStatusBadge = (meeting: Meeting) => {
    if (meeting.role === 'organizer') {
      const accepted = meeting.participants?.filter(p => p.rsvp_status === 'accepted').length || 0;
      const total = meeting.participants?.length || 0;
      return (
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {accepted}/{total} accepted
        </Badge>
      );
    } else {
      switch (meeting.myRsvp) {
        case 'accepted':
          return <Badge className="bg-success/10 text-success">Accepted</Badge>;
        case 'declined':
          return <Badge variant="destructive">Declined</Badge>;
        default:
          return <Badge variant="secondary">Pending</Badge>;
      }
    }
  };

  if (loading) {
    return <PageLoader message="Loading your meetings..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-1">Schedule and manage your team meetings</p>
        </div>
        <Button onClick={() => setShowScheduleDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <CalendarDays className="w-4 h-4" />
            Past ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingMeetings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-2">
                <EmptyState
                  icon={Calendar}
                  title="No meetings scheduled"
                  description="Your calendar is clear! Schedule a meeting with teammates to collaborate in real-time."
                  action={{
                    label: "Schedule your first meeting",
                    onClick: () => setShowScheduleDialog(true),
                  }}
                  variant="minimal"
                />
              </CardContent>
            </Card>
          ) : (
            upcomingMeetings.map((meeting) => {
              const { date, time, timezone, full } = formatDateTime(meeting.scheduled_time);
              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">{meeting.title}</h3>
                            {getStatusBadge(meeting)}
                          </div>

                          {meeting.description && (
                            <p className="text-muted-foreground text-sm mb-3">{meeting.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {date}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {time} {timezone} ({meeting.duration_minutes} min)
                            </div>
                            {meeting.participants && (
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                              </div>
                            )}
                            {meeting.role === 'participant' && meeting.organizer && (
                              <div className="flex items-center gap-1.5">
                                <span>Organized by</span>
                                <span className="text-foreground font-medium">
                                  {meeting.organizer.first_name} {meeting.organizer.last_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          {meeting.meeting_link && (
                            <Button size="sm" asChild className="gap-2">
                              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Video className="w-4 h-4" />
                                Join
                              </a>
                            </Button>
                          )}

                          {meeting.role === 'participant' && meeting.myRsvp === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success hover:bg-success/10"
                                onClick={() => handleRsvp(meeting.id, 'accepted')}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleRsvp(meeting.id, 'declined')}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-2">
                <EmptyState
                  icon={CalendarDays}
                  title="No past meetings"
                  description="Your meeting history will show up here. Start by scheduling your first meeting!"
                  variant="minimal"
                />
              </CardContent>
            </Card>
          ) : (
            pastMeetings.map((meeting) => {
              const { date, time } = formatDateTime(meeting.scheduled_time);
              return (
                <Card key={meeting.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>{date}</span>
                          <span>{time}</span>
                          <span>{meeting.duration_minutes} min</span>
                        </div>
                      </div>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <ScheduleMeetingDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        onSuccess={() => {
          loadMeetings();
          setShowScheduleDialog(false);
        }}
      />
    </motion.div>
  );
}
