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
  UsersGroup,
  Camera,
  AddPlus,
  CheckBig,
  CloseMd,
  ChevronRight,
  Loading,
  CalendarCheck
} from "react-coolicons";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ScheduleMeetingDialog } from "@/components/schedule-meeting-dialog";
import { EmptyState } from "@/components/empty-state";
import { PageLoader } from "@/components/loading-states";
import { generateGoogleCalendarUrl } from "@/lib/calendar-utils";

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
          <AddPlus className="w-4 h-4" />
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
            <CalendarCheck className="w-4 h-4" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMeetings.map((meeting) => {
                const { date, time, timezone, full } = formatDateTime(meeting.scheduled_time);
                return (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="hover:shadow-md transition-all h-full bg-card border border-border/50">
                      <CardContent className="p-4 flex flex-col h-full">
                        {/* Header with title and status */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm text-foreground line-clamp-2 flex-1">{meeting.title}</h3>
                          {getStatusBadge(meeting)}
                        </div>

                        {meeting.description && (
                          <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{meeting.description}</p>
                        )}

                        {/* Meeting details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary/70" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary/70" />
                            <span>{time} · {meeting.duration_minutes}m</span>
                          </div>
                          {meeting.participants && (
                            <div className="flex items-center gap-1.5">
                              <UsersGroup className="w-3.5 h-3.5 text-primary/70" />
                              <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {meeting.role === 'participant' && meeting.organizer && (
                            <p className="text-xs pt-1">
                              By <span className="text-foreground font-medium">{meeting.organizer.first_name}</span>
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50">
                          {meeting.meeting_link && (
                            <Button size="sm" asChild className="gap-2 flex-1">
                              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                <Camera className="w-4 h-4" />
                                Join
                              </a>
                            </Button>
                          )}

                          {/* Add to Google Calendar */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 border-border/60 hover:bg-accent hover:border-primary/30 dark:border-border/40 dark:hover:bg-accent/80 transition-colors"
                            onClick={() => {
                              const url = generateGoogleCalendarUrl({
                                title: meeting.title,
                                startTime: new Date(meeting.scheduled_time),
                                durationMinutes: meeting.duration_minutes,
                                description: meeting.description
                                  ? `${meeting.description}${meeting.meeting_link ? `\n\nJoin: ${meeting.meeting_link}` : ''}`
                                  : meeting.meeting_link
                                    ? `Join: ${meeting.meeting_link}`
                                    : '',
                                location: meeting.meeting_link || '',
                              });
                              window.open(url, '_blank');
                            }}
                          >
                            <img
                              src="/google-calendar-icon.svg"
                              alt=""
                              className="w-4 h-4"
                            />
                            <span className="hidden sm:inline">Add to Calendar</span>
                          </Button>

                          {meeting.role === 'participant' && meeting.myRsvp === 'pending' && (
                            <div className="flex gap-2 flex-1">
                              <Button
                                size="sm"
                                className="flex-1 bg-success hover:bg-success/90 text-success-foreground gap-1.5"
                                onClick={() => handleRsvp(meeting.id, 'accepted')}
                              >
                                <CheckBig className="w-5 h-5" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 gap-1.5"
                                onClick={() => handleRsvp(meeting.id, 'declined')}
                              >
                                <CloseMd className="w-5 h-5" />
                                Decline
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMeetings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-2">
                <EmptyState
                  icon={CalendarCheck}
                  title="No past meetings"
                  description="Your meeting history will show up here. Start by scheduling your first meeting!"
                  variant="minimal"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastMeetings.map((meeting) => {
                const { date, time } = formatDateTime(meeting.scheduled_time);
                return (
                  <Card key={meeting.id} className="bg-muted/30 border border-border/50">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-base text-foreground/80 line-clamp-2 flex-1">{meeting.title}</h3>
                        <Badge variant="outline" className="bg-muted text-muted-foreground shrink-0">Completed</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                        <span>· {meeting.duration_minutes} min</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
