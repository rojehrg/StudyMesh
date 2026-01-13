# Attunly - Product Rundown

## One-Liner
**A Slack layer that replaces silence with clarity when you're waiting on someone.**

---

## The Problem

When teams work across timezones, simple requests become day-long waits:
- You send a message. No response. Did they see it?
- They're 8 hours ahead. By the time they respond, you've lost a full day.
- You don't want to nag, but you can't afford to just wait and hope.
- The silence says nothing.

---

## The Solution

Attunly gives you visibility into what's happening with your request:
1. **You know when they saw it**
2. **You know if they're blocked (and why)**
3. **You know when it's done**

---

## Core Feature: Request a Response

### How It Works

**Step 1: User types `/attunly` in Slack**

A modal opens with three fields:
- **Who do you need a response from?** (user picker)
- **What do you need from them?** (one sentence)
- **When do you need to hear back?** (dropdown: 2 hours, 4 hours, end of day, tomorrow, etc.)

**Step 2: Owner receives a DM**

```
@Sarah is waiting on you for:

-> Confirm the API change is safe to ship

By: in 4 hours

[Start]  [Blocked]  [Done]
```

**Step 3: Real-time visibility**

| Owner Action | Requester Sees |
|--------------|----------------|
| Clicks "Start" | "Sarah saw your request and started looking into it" |
| Clicks "Blocked" | "Sarah is blocked because: [their reason]" |
| Clicks "Done" | "Sarah marked your request as done" |

---

## The Three Buttons

The owner has exactly three options - nothing more:

| Button | What Happens |
|--------|--------------|
| **Start** | Requester notified they're working on it |
| **Blocked** | Opens free-text modal: "What's getting in the way right now?" -> Requester sees the reason |
| **Done** | Requester notified it's complete |

---

## Data Model

```
momentum_locks
|- workspace_id (Slack team)
|- channel_id, thread_ts (context)
|- requester_user_id (who needs the outcome)
|- owner_user_id (who must deliver)
|- required_outcome (one sentence)
|- deadline_at (just for context)
|- status: draft -> active -> started | blocked | done
|- fallback_user_id (optional escalation)

momentum_lock_events
|- lock_id
|- event_type: created, started, blocked, done, escalated
|- actor_user_id
|- payload (JSONB - e.g., blocked reason)
```

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle |
| Auth | Supabase Auth |
| Styling | Tailwind + Coffee color palette |
| UI | Radix primitives |
| Hosting | Vercel |
| Integrations | Slack API |

---

## Brand Guidelines

| Rule | Details |
|------|---------|
| Colors | Coffee palette only (espresso, cortado, latte, foam, cream, paper) |
| Typography | Source Serif 4 (editorial feel) |
| Icons | None (except Slack logo and mesh mark) |
| Emojis | Never |
| Tone | Calm, neutral, non-judgmental |

---

## Key Screens

### Landing Page (attunly.com)
- Hero: "Wait on people. Without the silence."
- Interactive demo showing the before/after
- Three value props: Request, See, Know
- FAQ addressing "how is this different from DMing"

### Beta Request (/beta)
- Collects: email, company size, role, blocker
- Currently onboarding distributed teams

### Web App (authenticated)
- `/dashboard` - Status overview
- `/settings` - Profile, integrations
- `/team` - Team members
- `/find-help` - Web-based search (backup to Slack)

---

## Target Users

1. **Distributed teams** across timezones (SF + London, NYC + Singapore)
2. **Remote-first companies** where async is the default
3. **Growing startups** where "who knows what" isn't documented
4. **Cross-functional teams** with handoffs between departments

---

## Key Differentiators

| vs. DMing | vs. Project Management Tools |
|-----------|------------------------------|
| Visibility into status | Lightweight (3 buttons) |
| Blocked is a first-class response | Lives in Slack, not another app |
| No awkward follow-ups | No tickets, boards, or ceremonies |

---

## Current Stage

- **Beta** - onboarding distributed teams
- **MVP Feature**: Simple request -> response flow with visibility
- **Pricing**: Redirects to beta signup (no pricing set yet)

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/slack/commands` | Handles `/attunly` slash command |
| `POST /api/slack/interactions` | Handles button clicks and modal submissions |
| `POST /api/beta-request` | Beta signup form submission |

---

## Metrics (North Star)

**Send Rate** = Locks Sent / Modals Opened

Tracked via `command_events` table:
- `invoked` - `/attunly` typed
- `modal_opened` - Modal displayed
- `sent` - Lock created
- `abandoned` - Modal closed without sending

---

## What's NOT in MVP

- ~~Lingo Translation~~ (removed from pivot)
- ~~Knowledge Graph~~ (still exists but not core)
- ~~AI Matching~~ (still exists but not core)
- Escalation cron job (schema exists, not fully implemented)
- Fallback owner flow (schema exists, simplified for MVP)
