# Spec 009 — Polish, Design Refresh & Knowledge Discovery Integration

## Overview

This spec covers three interconnected workstreams:
1. **Design Refresh**: New color palette with off-white "notebook" aesthetic and pastel hierarchy
2. **Bug Fix**: Resolve autosave error in settings page
3. **Strategic Feature**: Integrate knowledge discovery to address fragmented expertise in orgs with mixed internal/external workforce

---

## Part 1: The Problem — Knowledge Fragmentation in Modern Orgs

### Context (from user research)

> "His team is really disorganized. The company has been around for 10+ years (is about to IPO soon) and a lot of the work has been done by contractors overseas. Knowledge is between internal and external groups and moves around quite a bit as people join and leave their contract. A lot of things just aren't organized centrally and there are a bunch of information silos."

### Pain Points

| Pain Point | Impact |
|------------|--------|
| **High contractor turnover** | Knowledge walks out the door constantly |
| **Internal vs external silos** | Who knows what isn't clear across team boundaries |
| **10+ years of accumulated chaos** | No single source of truth for expertise |
| **IPO pressure** | Need to get organized fast, reduce key-person risk |
| **Tribal knowledge** | Critical info lives in people's heads, not systems |

### Why MeshFlow Can Solve This

MeshFlow already has:
- **Knowledge areas tagging** — People declare what they know
- **Pod structure** — Organize by team/project/function
- **Nudge system** — Ask for help contextually
- **Availability coordination** — Know when people are reachable

What's missing:
- **Knowledge discovery** — "Who knows about X?" across the org
- **Expertise mapping** — Visual/searchable view of org knowledge
- **Knowledge retention** — Capture what contractors/departing employees know
- **Cross-team visibility** — Break down silos between internal/external

---

## Part 2: Design Refresh — Off-White Notebook Aesthetic

### Current State
- Background: `0 0% 99%` (almost pure white)
- Primary: Professional blue (`220 70% 50%`)
- Accent: Warm orange (`24 95% 53%`)
- Using Catppuccin palette (complex, 20+ color tokens)

### Target State
Inspired by: **Notion** (warm, paper-like), **Claude** (soft, approachable)

#### Philosophy
- **Off-white background** — Like a quality notebook or paper
- **Simple color hierarchy** — 3-4 colors max, clear purpose for each
- **Pastel palette** — Soft, non-aggressive, professional but friendly
- **Warmth** — Not clinical/sterile, feels human

### New Color Palette

```css
:root {
  /* ===== LIGHT MODE ===== */

  /* Background - Warm off-white (notebook paper) */
  --background: 40 20% 98%;        /* #FAFAF7 - warm cream */
  --foreground: 30 10% 15%;        /* #272420 - warm charcoal */

  /* Cards - Pure white for elevation */
  --card: 0 0% 100%;               /* #FFFFFF */
  --card-foreground: 30 10% 15%;

  /* Primary - Soft indigo/periwinkle (trust, calm action) */
  --primary: 230 60% 60%;          /* #6B7BCC - pastel indigo */
  --primary-foreground: 0 0% 100%;

  /* Secondary - Warm gray for subtle elements */
  --secondary: 30 10% 94%;         /* #F2F0ED */
  --secondary-foreground: 30 10% 25%;

  /* Accent - Soft coral/peach (warmth, highlights) */
  --accent: 15 70% 70%;            /* #E8A090 - pastel coral */
  --accent-foreground: 30 10% 15%;

  /* Muted - For disabled/subtle text */
  --muted: 30 10% 92%;
  --muted-foreground: 30 8% 45%;

  /* Semantic colors - Pastel versions */
  --success: 145 45% 55%;          /* Soft sage green */
  --success-foreground: 0 0% 100%;
  --warning: 40 75% 60%;           /* Soft amber */
  --warning-foreground: 30 10% 15%;
  --destructive: 0 55% 60%;        /* Soft red */
  --destructive-foreground: 0 0% 100%;
  --info: 200 60% 60%;             /* Soft sky blue */
  --info-foreground: 0 0% 100%;

  /* Borders - Very subtle, warm */
  --border: 30 10% 88%;
  --input: 30 10% 88%;
  --ring: 230 60% 60%;
}

.dark {
  /* ===== DARK MODE ===== */

  /* Background - Warm dark (not pure black) */
  --background: 30 15% 10%;        /* Warm charcoal */
  --foreground: 40 15% 92%;        /* Warm off-white */

  /* Cards - Slightly elevated */
  --card: 30 12% 14%;
  --card-foreground: 40 15% 92%;

  /* Primary - Lighter pastel indigo for dark mode */
  --primary: 230 55% 72%;
  --primary-foreground: 30 15% 10%;

  /* Secondary */
  --secondary: 30 10% 18%;
  --secondary-foreground: 40 12% 80%;

  /* Accent - Brighter coral for visibility */
  --accent: 15 65% 65%;
  --accent-foreground: 30 15% 10%;

  /* Muted */
  --muted: 30 10% 16%;
  --muted-foreground: 30 8% 55%;

  /* Semantic - Adjusted for dark mode visibility */
  --success: 145 50% 50%;
  --success-foreground: 30 15% 10%;
  --warning: 40 80% 55%;
  --warning-foreground: 30 15% 10%;
  --destructive: 0 60% 55%;
  --destructive-foreground: 0 0% 100%;
  --info: 200 65% 55%;
  --info-foreground: 30 15% 10%;

  /* Borders */
  --border: 30 10% 22%;
  --input: 30 10% 22%;
  --ring: 230 55% 72%;
}
```

### Color Hierarchy (Simplified)

| Role | Light Mode | Dark Mode | Usage |
|------|------------|-----------|-------|
| **Background** | Warm cream `#FAFAF7` | Warm charcoal | Page background |
| **Card** | Pure white | Slightly lighter | Elevated surfaces |
| **Primary** | Pastel indigo | Lighter indigo | Buttons, links, focus states |
| **Accent** | Pastel coral | Brighter coral | Highlights, badges, special elements |
| **Muted** | Warm gray | Dark gray | Disabled, secondary text |

### Design Tokens to Simplify

**Remove**: All Catppuccin-specific tokens (`ctp-*`, `ctp-latte-*`, `ctp-mocha-*`)

**Keep**: Semantic tokens only (`background`, `foreground`, `primary`, `secondary`, `accent`, `muted`, `card`, `destructive`, `success`, `warning`, `info`)

---

## Part 3: Bug Fix — Autosave Error in Settings

### Current Behavior
Settings page shows "Error autosaving" status intermittently.

### Root Cause Analysis

Looking at `src/app/(dashboard)/settings/page.tsx`:

```typescript
// Issue 1: State split across multiple variables
const [profile, setProfile] = useState<any>(null);
const [email, setEmail] = useState("");
const [emailNotifications, setEmailNotifications] = useState(true);
const [timezone, setTimezone] = useState("...");
const [availabilitySlots, setAvailabilitySlots] = useState<...>([]);
// etc.

// Issue 2: When email/notifications change, they trigger profile spread
onChange={(e) => {
  setEmail(e.target.value);
  if (profile) {
    setProfile({ ...profile }); // Creates new ref, triggers save effect
  }
}}

// Issue 3: Save effect compares profile JSON, but email/notifications are outside profile
useEffect(() => {
  const currentData = JSON.stringify(profile);
  if (currentData === lastSavedRef.current) return; // Comparison incomplete
  // ...saves
}, [profile, ...]);
```

**Problems:**
1. `email`, `emailNotifications`, `timezone`, `availabilitySlots` are separate from `profile` state
2. Spreading profile (`{ ...profile }`) triggers effect but doesn't change actual data
3. `lastSavedRef` comparison only checks `profile`, not the other fields
4. Possible race conditions between multiple save triggers

### Proposed Fix

**Option A: Consolidate all editable fields into profile state**
```typescript
const [profile, setProfile] = useState<ProfileData | null>(null);
// Where ProfileData includes email, emailNotifications, timezone, slots, etc.
```

**Option B: Track all fields in comparison**
```typescript
const getFullState = () => JSON.stringify({
  ...profile,
  email,
  emailNotifications,
  timezone,
  availabilitySlots,
  currentlyAvailable,
  lookingToHelp,
});

useEffect(() => {
  const currentData = getFullState();
  if (currentData === lastSavedRef.current) return;
  // ...
}, [profile, email, emailNotifications, timezone, availabilitySlots, ...]);
```

**Option C: Debounce at field level, not effect level**
Use a proper form library or debounced save per field change.

**Recommended: Option A** — Consolidate state into single `profile` object for simpler mental model and fewer sync bugs.

---

## Part 4: Knowledge Discovery Feature — Strategic Integration

### Vision

Transform MeshFlow from "coordination tool" to "knowledge + coordination platform":

> **"Find the right person, at the right time, with the right knowledge"**

### Feature: Knowledge Directory

A searchable, org-wide view of who knows what.

#### UI Concept: Knowledge Search

```
+----------------------------------------------------------+
|  🔍 Search knowledge areas...                             |
|  [Salesforce setup____________________________] [Search]  |
|                                                           |
|  Results matching "Salesforce"                            |
|  ─────────────────────────────────────────────────────── |
|                                                           |
|  👤 Maria Chen (Sales Ops) — Internal                     |
|     "Salesforce admin, CPQ, reporting"                    |
|     Available: Today 2-5pm PT                             |
|     [View Profile] [Send Nudge]                           |
|                                                           |
|  👤 James O'Connor (IT Contractor) — External             |
|     "Salesforce integration, API, data migration"         |
|     Available: Tomorrow 9am-12pm EST                      |
|     [View Profile] [Send Nudge]                           |
|                                                           |
|  💡 Related knowledge areas:                              |
|     CRM, HubSpot, Sales automation, Lead scoring          |
+----------------------------------------------------------+
```

#### Data Model Additions

```sql
-- Track employee type for internal/external visibility
ALTER TABLE profiles ADD COLUMN employee_type TEXT DEFAULT 'internal';
-- Values: 'internal', 'contractor', 'vendor', 'partner'

-- Track contract end dates for contractors (optional)
ALTER TABLE profiles ADD COLUMN contract_end_date DATE;

-- Knowledge area popularity/search tracking
CREATE TABLE knowledge_search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INT,
  clicked_profile_id UUID REFERENCES profiles(user_id),
  searched_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### API Endpoints

```
GET /api/knowledge/search?q=salesforce&pod_id=optional
  → Returns profiles matching knowledge areas with fuzzy matching
  → Includes availability snapshot
  → Respects pod boundaries (unless cross-pod enabled)

GET /api/knowledge/directory
  → Paginated list of all knowledge areas in org
  → Grouped by category or sorted by popularity

GET /api/knowledge/gaps
  → Analytics: What questions are being asked that no one can answer?
  → Useful for hiring/training decisions
```

### Feature: Knowledge Handoff (Contractor Offboarding)

When contractors leave, capture what they know.

#### UI Concept: Offboarding Prompt

```
+----------------------------------------------------------+
|  📋 Knowledge Handoff for James O'Connor                  |
|  Contract ending: Jan 15, 2025                            |
|                                                           |
|  James is listed as knowing:                              |
|  • Salesforce API integration                             |
|  • Data migration scripts                                 |
|  • Legacy CRM connector                                   |
|                                                           |
|  Who should inherit this knowledge?                       |
|  ─────────────────────────────────────────────────────── |
|  "Salesforce API integration"                             |
|     [ ] Maria Chen (already knows Salesforce)             |
|     [ ] Tom Wright (Sales Ops, could learn)               |
|     [ ] No one (flag as knowledge gap)                    |
|                                                           |
|  Notes/Documentation links:                               |
|  [Add links to docs, repos, or recordings...]             |
|                                                           |
|                              [Save Handoff Plan]          |
+----------------------------------------------------------+
```

#### Data Model

```sql
CREATE TABLE knowledge_handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  departing_user_id UUID REFERENCES profiles(user_id),
  knowledge_area TEXT NOT NULL,
  inheriting_user_id UUID REFERENCES profiles(user_id),
  status TEXT DEFAULT 'pending', -- pending, transferred, gap
  notes TEXT,
  documentation_links TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

### Feature: Cross-Team Knowledge Visibility

Break down silos between internal teams and external contractors.

#### Visibility Controls (Per Pod)

```typescript
// Pod settings
{
  allowCrossPodHelp: boolean,      // Already exists
  visibleToExternal: boolean,      // New: Can contractors see this pod?
  externalCanNudge: boolean,       // New: Can contractors request help from internals?
}
```

#### UI: Pod Member Badge

```
👤 Maria Chen
   Sales Ops • Internal
   ✅ Available now

👤 James O'Connor
   IT Contractor • External
   📅 Contract ends Jan 15
   ✅ Available now
```

---

## Part 5: Implementation Phases

### Phase 1: Design Refresh (Immediate)
1. Replace color palette in `globals.css`
2. Remove Catppuccin tokens from `tailwind.config.ts`
3. Test all pages in light/dark mode
4. Verify WCAG contrast compliance

### Phase 2: Bug Fixes (Immediate)
1. Consolidate settings state into single `profile` object
2. Fix autosave comparison logic
3. Test save/load cycle thoroughly

### Phase 3: Knowledge Discovery MVP
1. Add `employee_type` field to profiles
2. Build knowledge search page (`/knowledge` or `/directory`)
3. Enhance fuzzy matching to surface related skills
4. Add search analytics tracking

### Phase 4: Knowledge Handoff
1. Add contract end date tracking
2. Build offboarding prompts for managers
3. Create handoff workflow UI
4. Track knowledge gaps

### Phase 5: Cross-Team Visibility
1. Add visibility controls to pods
2. Show internal/external badges
3. Respect visibility in search results

---

## Acceptance Criteria

### Design Refresh
- [ ] Background is warm off-white (`#FAFAF7` or similar)
- [ ] Only 4-5 primary colors in use (plus semantic colors)
- [ ] All colors are pastel/soft
- [ ] Dark mode maintains warmth (not pure black)
- [ ] Catppuccin tokens removed
- [ ] Landing page feels like Notion/Claude (paper-like, warm)

### Bug Fix
- [ ] Settings autosave works without errors
- [ ] No "Error saving" status during normal use
- [ ] All fields (email, notifications, availability) save correctly
- [ ] No race conditions between multiple saves

### Knowledge Discovery (MVP)
- [ ] Search bar to find people by knowledge area
- [ ] Results show availability + quick actions
- [ ] Fuzzy matching works (e.g., "JS" finds "JavaScript")
- [ ] Internal/external employee type visible

---

---

## Part 6: Email Notification Service

### Current State
- Email field exists in profiles
- `email_notifications` toggle exists
- No actual email sending implemented

### Implementation

#### Service Choice: Resend
**Why Resend over SendGrid/Mailgun:**
- Modern developer experience
- React Email support (build emails with JSX)
- Generous free tier (3,000 emails/month)
- Simple API, great docs

#### Email Types to Support

| Email Type | Trigger | Priority |
|------------|---------|----------|
| **Nudge received** | Someone sends you a help request | High |
| **Meeting invite** | Added as participant to meeting | High |
| **Meeting reminder** | 15 min before scheduled meeting | Medium |
| **RSVP update** | Someone accepts/declines your invite | Medium |
| **Weekly digest** | Summary of unread nudges/meetings | Low |

#### Email Templates (React Email)

```
/src/emails/
  nudge-received.tsx      — "Sarah needs help with Salesforce"
  meeting-invite.tsx      — "You're invited: Q1 Planning sync"
  meeting-reminder.tsx    — "Starting in 15 minutes: ..."
  weekly-digest.tsx       — "Your MeshFlow week: 3 nudges, 2 meetings"
```

#### API Route

```typescript
// /api/notifications/email
POST /api/notifications/email
{
  type: 'nudge' | 'meeting_invite' | 'reminder' | 'digest',
  recipientId: string,
  data: { ... }
}
```

#### Environment Variables

```
RESEND_API_KEY=re_xxxxxxx
EMAIL_FROM=notifications@meshflow.app
```

---

## Part 7: Calendar Sync (Google Calendar & Outlook)

### Vision

Two-way sync between MeshFlow availability and external calendars.

### Features

#### Import: Calendar → MeshFlow
- Connect Google Calendar or Outlook
- Automatically mark busy times in MeshFlow
- Respect "Show as: Busy/Free" from calendar events
- Real-time sync via webhooks

#### Export: MeshFlow → Calendar
- MeshFlow meetings appear in your calendar
- Include meeting link, participants, topic
- Updates sync both ways (cancel in calendar = cancel in MeshFlow)

### UI: Settings > Calendar Integration

```
+----------------------------------------------------------+
|  📅 Calendar Integration                                  |
|                                                           |
|  Connect your calendar to automatically sync availability |
|                                                           |
|  ┌────────────────────────────────────────────────────┐  |
|  │  Google Calendar                                    │  |
|  │  [Connect Google Calendar]                          │  |
|  └────────────────────────────────────────────────────┘  |
|                                                           |
|  ┌────────────────────────────────────────────────────┐  |
|  │  Microsoft Outlook                                  │  |
|  │  [Connect Outlook]                                  │  |
|  └────────────────────────────────────────────────────┘  |
|                                                           |
|  Sync Settings:                                           |
|  ☑ Import busy times from calendar                       |
|  ☑ Export MeshFlow meetings to calendar                  |
|  ☐ Include event details in sync (vs just busy/free)     |
+----------------------------------------------------------+
```

### Data Model

```sql
CREATE TABLE calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  provider TEXT NOT NULL, -- 'google' | 'outlook'
  access_token TEXT NOT NULL, -- encrypted
  refresh_token TEXT NOT NULL, -- encrypted
  calendar_id TEXT, -- which calendar to sync
  sync_busy_times BOOLEAN DEFAULT true,
  sync_meetings BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calendar_events_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  external_event_id TEXT NOT NULL,
  title TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  show_as TEXT, -- 'busy' | 'free' | 'tentative'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, external_event_id)
);
```

### OAuth Flows

**Google Calendar:**
- Scope: `https://www.googleapis.com/auth/calendar.readonly` (import)
- Scope: `https://www.googleapis.com/auth/calendar.events` (export)

**Microsoft Outlook:**
- Scope: `Calendars.Read` (import)
- Scope: `Calendars.ReadWrite` (export)

### Sync Logic

```typescript
// Every 5 minutes, or via webhook
async function syncCalendarToAvailability(userId: string) {
  const events = await fetchCalendarEvents(userId, startOfWeek, endOfWeek);
  const busySlots = events
    .filter(e => e.showAs === 'busy')
    .map(e => ({ start: e.start, end: e.end }));

  // Mark these times as unavailable in MeshFlow
  await updateAvailabilityFromCalendar(userId, busySlots);
}
```

---

## Part 8: Recurring Meetings

### Use Cases
- Weekly team standups
- Bi-weekly 1:1s
- Monthly all-hands
- Office hours (e.g., "Fridays 2-3pm, come ask me anything")

### UI: Create Recurring Meeting

```
+----------------------------------------------------------+
|  📅 Schedule Meeting                                      |
|                                                           |
|  Title: [Weekly Engineering Standup______________]        |
|                                                           |
|  When: [Tuesday, Jan 7, 2025 ▼]  [9:00 AM ▼]             |
|  Duration: [30 minutes ▼]                                 |
|                                                           |
|  ☑ Repeat this meeting                                   |
|     Every: [1 ▼] [week ▼]                                |
|     On: ☑ Mon  ☐ Tue  ☐ Wed  ☐ Thu  ☐ Fri               |
|     Ends: ○ Never  ○ After [12] occurrences              |
|            ○ On [March 31, 2025]                          |
|                                                           |
|  Participants: [Select from pod...]                       |
|                                                           |
|                              [Create Series] [Cancel]     |
+----------------------------------------------------------+
```

### Data Model

```sql
-- Add recurrence to scheduled_meetings
ALTER TABLE scheduled_meetings ADD COLUMN recurrence_rule TEXT;
-- Format: RFC 5545 RRULE (e.g., "FREQ=WEEKLY;BYDAY=MO;COUNT=12")

ALTER TABLE scheduled_meetings ADD COLUMN recurrence_parent_id UUID
  REFERENCES scheduled_meetings(id);
-- For individual occurrences that link back to the parent

ALTER TABLE scheduled_meetings ADD COLUMN occurrence_date DATE;
-- Specific date for this occurrence (allows individual edits)
```

### Recurrence Patterns to Support

| Pattern | RRULE Example |
|---------|---------------|
| Daily | `FREQ=DAILY` |
| Weekly | `FREQ=WEEKLY;BYDAY=MO` |
| Bi-weekly | `FREQ=WEEKLY;INTERVAL=2;BYDAY=TU` |
| Monthly (date) | `FREQ=MONTHLY;BYMONTHDAY=15` |
| Monthly (day) | `FREQ=MONTHLY;BYDAY=2TU` (2nd Tuesday) |

### Editing Recurring Meetings

When editing a recurring meeting, prompt:
- **This occurrence only** — Creates exception for this date
- **This and all future** — Updates parent rule, regenerates future
- **All occurrences** — Updates entire series

### API Changes

```typescript
// Create recurring meeting
POST /api/meetings
{
  title: "Weekly Standup",
  scheduledTime: "2025-01-07T09:00:00Z",
  durationMinutes: 30,
  participants: ["user-1", "user-2"],
  recurrence: {
    frequency: "weekly",
    interval: 1,
    daysOfWeek: ["monday"],
    endType: "count",
    count: 12
  }
}

// Get meetings for date range (expands recurrences)
GET /api/meetings?start=2025-01-01&end=2025-01-31
```

---

## Part 9: Updated Implementation Phases

### Phase 1: Design Refresh (Immediate) ⏱️
1. Replace color palette in `globals.css` with warm off-white + pastels
2. Ensure dark mode is warm (not pure black, matches notebook aesthetic)
3. Remove Catppuccin tokens from `tailwind.config.ts`
4. Test all pages in light/dark mode
5. Verify WCAG contrast compliance

### Phase 2: Bug Fixes (Immediate) ⏱️
1. Consolidate settings state into single `profile` object
2. Fix autosave comparison logic
3. Test save/load cycle thoroughly

### Phase 3: Email Notifications ⏱️
1. Set up Resend account and API key
2. Create email templates with React Email
3. Implement `/api/notifications/email` endpoint
4. Add email sending to nudge and meeting flows
5. Build weekly digest job (optional, can defer)

### Phase 4: Calendar Sync
1. Set up Google OAuth for Calendar API
2. Set up Microsoft OAuth for Outlook
3. Build calendar connection UI in settings
4. Implement import (calendar → availability)
5. Implement export (meetings → calendar)
6. Set up webhook listeners for real-time sync

### Phase 5: Recurring Meetings
1. Add recurrence fields to scheduled_meetings table
2. Build recurrence UI in meeting creation
3. Implement RRULE parsing/expansion
4. Handle "edit this/future/all" logic
5. Sync recurring meetings to external calendars

### Phase 6: Knowledge Discovery
1. Add `employee_type` field to profiles
2. Build knowledge search page
3. Enhance fuzzy matching
4. Add internal/external badges

### Phase 7: Knowledge Handoff (Future)
1. Contract end date tracking
2. Offboarding prompts
3. Knowledge gap analytics

---

## Out of Scope (for this spec)

- Full organizational chart / hierarchy
- Skills verification / endorsements
- Automated knowledge extraction from Slack/docs
- Integration with HR systems for contractor data
- Video onboarding/training library

---

## Open Questions

1. **Should knowledge search be org-wide or pod-scoped by default?**
   - Org-wide helps break silos
   - Pod-scoped respects existing boundaries

2. **How to handle contractors without email access?**
   - Slack-only notification?
   - Manager invites them?

3. **Should we track "knowledge confidence" (self-rated)?**
   - Simple: Just list topics
   - Complex: Rate 1-5 for each topic
   - Recommendation: Start simple, add later if needed

---

## References

- Current settings page: `src/app/(dashboard)/settings/page.tsx`
- Color config: `src/app/globals.css`, `tailwind.config.ts`
- Matching logic: `src/lib/logic/matching.ts`
- Previous spec (007): Scheduling & availability system
