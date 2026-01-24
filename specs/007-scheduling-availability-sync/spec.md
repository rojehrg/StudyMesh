

# Spec 007 — Scheduling Sync, Granular Availability, Group Nudges & Meeting Coordination

## Goals
- Transform MeshFlow into a "supercharged Calendly" for remote teams — focus on knowing when people are free and scheduling meetings effortlessly.
- Replace restrictive availability presets (mornings/afternoons/weekends) with fully customizable time blocks per day.
- Enable group nudges: nudge multiple people in a pod and schedule meetings with them.
- Integrate Slack/email notifications for meeting invites.
- Remove the "Open to Help" toggle — it's no longer needed.
- Overhaul UI color scheme for consistency: dark mode, light mode, hover effects, and remove awkward borders.

---

## Problem Statement
Remote teams struggle to coordinate meeting times across different time zones and schedules. Even with multiple calendar tools, there's no central platform where:
1. Everyone's availability is visible at a glance
2. You can nudge a group of people and instantly find overlapping free slots
3. Meeting scheduling flows directly from availability data

---

## Scope & Requirements

### 1. Granular Availability System
**Replace current availability presets with a flexible time-block selector.**

- **Per-day time slots**: Users select specific time ranges for each day of the week (e.g., Monday 9:00 AM - 12:00 PM, 2:00 PM - 5:00 PM)
- **Time zone aware**: Store and display times with user's timezone
- **Optional activity labels**: Users can tag what they're doing during busy times (e.g., "Deep work", "Meetings", "Personal")
- **Checkbox grid UI**: Visual grid showing days × time slots for quick selection
- **Weekly schedule in profile/settings**: Persistent schedule that others can view

**Data model:**
```
availability_schedules
- id: uuid pk
- user_id: uuid fk -> profiles
- day_of_week: int (0-6, Sunday-Saturday)
- start_time: time
- end_time: time
- label: text nullable (what they're doing)
- timezone: text
- created_at: timestamp
- updated_at: timestamp
```

### 2. Group Nudges & Meeting Scheduling
**Extend nudges to support multiple recipients and meeting coordination.**

- **Multi-select nudge**: When nudging from a pod, select multiple members
- **Find overlapping availability**: Show time slots where all selected people are free
- **Schedule meeting**: Pick a slot, add topic/agenda, and create the meeting
- **Notification flow**:
  - Slack message to each participant (if configured)
  - Email notification (if Slack not available)
  - In-app notification always
- **Meeting entity**: Store scheduled meetings with participants, time, topic

**Data model:**
```
scheduled_meetings
- id: uuid pk
- organizer_id: uuid fk -> profiles
- pod_id: uuid nullable fk -> pods
- title: text not null
- description: text nullable
- scheduled_time: timestamptz not null
- duration_minutes: int default 30
- meeting_link: text nullable (Zoom/Google Meet/etc)
- status: text ('scheduled', 'completed', 'cancelled')
- created_at: timestamp
- updated_at: timestamp

meeting_participants
- id: uuid pk
- meeting_id: uuid fk -> scheduled_meetings
- user_id: uuid fk -> profiles
- rsvp_status: text ('pending', 'accepted', 'declined')
- notified_via: text[] ('slack', 'email', 'in_app')
- created_at: timestamp
```

### 3. Remove "Open to Help" Toggle
**Completely remove this feature from:**
- Settings page
- Sidebar
- Profile display
- Any related DB fields or queries
- Remove `open_to_help` column from profiles if exists

### 4. UI/Color Scheme Overhaul
**Create consistent, polished design system.**

#### Dark Mode / Light Mode
- Implement proper theme toggle (system preference detection + manual override)
- Define CSS variables for all colors in both themes
- Ensure all components respect theme

#### Color Tokens
```css
/* Light mode */
--background: #ffffff
--foreground: #0f172a
--card: #ffffff
--card-foreground: #0f172a
--primary: #6366f1 (indigo)
--primary-foreground: #ffffff
--secondary: #f1f5f9
--muted: #f8fafc
--muted-foreground: #64748b
--border: transparent /* NO visible borders */
--accent: #818cf8

/* Dark mode */
--background: #0f172a
--foreground: #f8fafc
--card: #1e293b
--card-foreground: #f8fafc
--primary: #818cf8
--primary-foreground: #0f172a
--secondary: #334155
--muted: #1e293b
--muted-foreground: #94a3b8
--border: transparent
--accent: #a5b4fc
```

#### Hover Effects
- Subtle scale transform (1.02) on interactive cards
- Background color shift on hover
- Smooth transitions (150-200ms ease)
- Consistent across light and dark modes

#### Border Removal
- Audit all components for visible borders
- Replace with subtle shadows or background color differentiation
- Use spacing and color to create visual hierarchy instead of borders

---

## UX / UI Specifications

### Availability Settings (Settings > Availability)
```
+--------------------------------------------------+
|  Your Weekly Schedule                             |
|                                                   |
|  Timezone: [America/New_York ▼]                   |
|                                                   |
|  ┌─────────────────────────────────────────────┐  |
|  │     6am  9am  12pm  3pm  6pm  9pm  12am    │  |
|  │ Mon  [====][====]      [===]               │  |
|  │ Tue  [====][====]      [===]               │  |
|  │ Wed  [====]            [===]               │  |
|  │ Thu  [====][====]      [===]               │  |
|  │ Fri  [====][====]                          │  |
|  │ Sat                                         │  |
|  │ Sun                                         │  |
|  └─────────────────────────────────────────────┘  |
|                                                   |
|  Click and drag to select available times         |
|  [+ Add time block]                               |
+--------------------------------------------------+
```

### Group Nudge Flow (Pod Member View)
```
1. Select members (checkboxes next to each member)
2. Click "Nudge Selected" or "Schedule Meeting"
3. Modal opens showing:
   - Selected members with their availability previews
   - Overlapping free slots highlighted
   - Topic/agenda input
   - Duration selector (15/30/45/60 min)
   - Meeting link input (optional)
4. Confirm → Creates meeting, notifies all participants
```

### Member Availability Preview
```
+----------------------------------+
|  👤 Jane Smith                    |
|  Available today: 9am-12pm, 3-5pm |
|  [View full schedule]             |
+----------------------------------+
```

---

## API Endpoints

### Availability
- `GET /api/availability/:userId` — Get user's availability schedule
- `PUT /api/availability` — Update current user's availability
- `POST /api/availability/overlap` — Find overlapping slots for multiple users
  - Body: `{ userIds: string[], date?: string, duration?: number }`
  - Returns: `{ slots: { start: string, end: string }[] }`

### Meetings
- `POST /api/meetings` — Create meeting
- `GET /api/meetings` — List user's meetings (organized or participating)
- `PATCH /api/meetings/:id` — Update meeting (cancel, reschedule)
- `POST /api/meetings/:id/rsvp` — RSVP to meeting

### Notifications
- Extend existing Slack webhook to handle meeting invites
- Add email notification via Resend/SendGrid for meeting invites

---

## Acceptance Criteria

### Availability
- [ ] Users can set availability for each day of the week with specific time ranges
- [ ] Users can set their timezone
- [ ] Availability is visible on user's profile/card
- [ ] Click-and-drag or checkbox interface works smoothly

### Group Nudges & Meetings
- [ ] Can select multiple members from a pod
- [ ] System calculates overlapping availability
- [ ] Can create a meeting with selected time slot
- [ ] All participants receive notifications (Slack if configured, email as fallback, always in-app)
- [ ] Meetings appear in a "My Meetings" section

### "Open to Help" Removal
- [ ] Toggle removed from Settings
- [ ] Toggle removed from Sidebar
- [ ] No traces in UI or API

### UI Overhaul
- [ ] Dark mode toggle in header/settings
- [ ] All components use CSS variables
- [ ] No visible awkward borders anywhere
- [ ] Consistent hover effects across all interactive elements
- [ ] Smooth transitions throughout

---

## Out of Scope (for now)
- Full calendar integration (Google Calendar, Outlook sync)
- Recurring meetings
- Calendar embed/widget
- Video call integration (just store external links)
- Automatic time zone conversion display (users see their own TZ)

---

## Migration & Rollout

### Database Migrations
1. Create `availability_schedules` table
2. Create `scheduled_meetings` table
3. Create `meeting_participants` table
4. Remove `open_to_help` from `profiles` (if exists)
5. Migrate any existing availability data to new format

### Feature Flags (optional)
- `ENABLE_GROUP_NUDGES=true`
- `ENABLE_MEETING_SCHEDULING=true`

### Environment Variables
- Existing: `SLACK_WEBHOOK_URL`
- New: `RESEND_API_KEY` or `SENDGRID_API_KEY` (for email notifications)

---

## Implementation Phases

### Phase 1: Availability System
1. DB migration for `availability_schedules`
2. Availability settings UI with time block selector
3. API endpoints for CRUD
4. Display availability on member cards

### Phase 2: Group Nudges & Meetings
1. DB migration for meetings tables
2. Multi-select in pod member list
3. Overlap calculation logic
4. Meeting creation flow
5. Notification integration (Slack + in-app)

### Phase 3: UI Overhaul
1. Define CSS variable system
2. Implement dark/light mode toggle
3. Audit and remove borders
4. Add consistent hover effects
5. Test all components in both themes

### Phase 4: Cleanup
1. Remove "Open to Help" toggle everywhere
2. Remove related DB column
3. Final polish and testing

---

## Technical Notes

### Overlap Calculation Algorithm
```typescript
function findOverlappingSlots(
  schedules: UserSchedule[],
  date: Date,
  durationMinutes: number
): TimeSlot[] {
  // 1. Get all users' availability for the given date's day of week
  // 2. Convert to common timezone (UTC)
  // 3. Find intersection of all time ranges
  // 4. Filter slots that are >= durationMinutes
  // 5. Return available slots
}
```

### Theme Implementation
- Use `next-themes` package for Next.js
- CSS variables in `globals.css` with `[data-theme="dark"]` selector
- ThemeProvider wrapping app
- Toggle component using `useTheme` hook
