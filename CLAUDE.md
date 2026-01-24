# Attunly

## Project Overview

**Slack-first async coordination platform**

Attunly tracks attention, not just tasks. While task tools track work state, Attunly tracks human state - knowing when someone is focused, available, or needs protection from interruptions.

### Core Insight
Traditional task tools answer "what needs to be done?" Attunly answers "who can help right now, and how do I get their attention without disrupting their flow?"

### Value Proposition
- Reduce context-switching costs by batching interruptions
- Respect focus time and working hours across timezones
- Escalate intelligently when deadlines approach
- Surface team availability without manual status updates

---

## Slack Commands

### Primary Commands

| Command | Purpose |
|---------|---------|
| `/attunly` or `/attunly lock` | Create momentum lock (with AI inference from thread context) |
| `/attunly status` | Show your active locks |
| `/attunly help` | Show available commands |
| `/attunly whosnow` | Who's in working hours now |
| `/attunly overlap @user` | Find working hour overlap with another user |
| `/attunly handoff @user` | EOD handoff summary |
| `/attunly standup` | Auto-generated standup from recent activity |
| `/attunly digest` | Weekly activity summary |

### Shortcut Aliases

| Alias | Equivalent |
|-------|------------|
| `/standup` | `/attunly standup` |
| `/status` | `/attunly status` |
| `/digest` | `/attunly digest` |
| `/whosnow` | `/attunly whosnow` |
| `/handoff` | `/attunly handoff` |
| `/overlap` | `/attunly overlap` |

---

## Momentum Locks

Momentum locks are the core feature - requests for attention that respect the recipient's focus and timezone.

### Lock Creation
- Invoked via `/attunly` or `/attunly lock`
- AI inference from thread context when invoked in a thread
- Modal for setting urgency, deadline, and escalation preferences

### Lock Status Lifecycle

```
draft → active → started → blocked → done
```

| Status | Meaning |
|--------|---------|
| `draft` | Lock created but not submitted |
| `active` | Waiting for owner to start |
| `started` | Owner has begun working on it |
| `blocked` | Owner is blocked, needs help |
| `done` | Lock completed |

### Features
- **Multi-level escalation chains** - Define who to escalate to if unacknowledged
- **Timezone-aware wake-up delivery** - Delivers when recipient enters working hours
- **Proactive deadline alerts** - Notifies requester at 75% of time elapsed if not started
- **Smart reminders** - 12h, 3h, 1h before deadline

---

## Supernatural Features

Features that "just work" without user configuration:

### Timezone Awareness
- Shows owner's local time in all lock displays
- Detects working hours (8am-6pm local time)
- Detects sleep windows automatically
- Schedules deliveries for appropriate times

### Proactive Alerts
- At 75% of deadline elapsed: notifies requester if lock not started
- Gives requester time to escalate or find alternative help

### Working Hours Detection
- Default: 8am-6pm in user's local timezone
- Respects focus by not delivering outside working hours
- Shows "available" / "in working hours" status for team

### Sleep Window Detection
- Automatically detects likely sleep hours
- Holds non-urgent notifications until wake-up time

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── slack/          # Slack webhook handlers
│   │   └── cron/           # Scheduled jobs
│   └── ...
├── lib/
│   └── slack/
│       └── momentum-lock/  # Core momentum lock handlers
└── ...
docs/
└── features/               # Feature specifications
```

---

## Key Handlers

### Momentum Lock Module (`src/lib/slack/momentum-lock/`)

| File | Purpose |
|------|---------|
| `command-handler.ts` | Slash command parsing + AI thread inference |
| `modal-builder.ts` | Lock creation modal construction |
| `status-handler.ts` | Status display and updates |
| `escalation.ts` | Multi-level escalation chain logic |
| `messages.ts` | All Slack message builders |
| `reminders.ts` | Reminder scheduling and delivery |
| `whosnow-handler.ts` | Team availability display |
| `overlap-handler.ts` | Timezone overlap calculation |
| `handoff-handler.ts` | EOD handoff summaries |
| `standup-handler.ts` | Auto-generated standup |
| `digest-handler.ts` | Weekly digest generation |

---

## Cron Jobs

### `momentum-locks` (`src/app/api/cron/momentum-locks/`)

Runs periodically to handle:
- Lock expirations
- Wake-up deliveries (timezone-aware)
- Escalation triggers
- Proactive alerts (75% threshold)
- Reminder deliveries (12h, 3h, 1h)

### `digest` (`src/app/api/cron/digest/`)

Weekly job to generate and deliver activity digests.

---

## Database

### Core Tables

- `momentum_locks` - Lock records with status, deadlines, escalation config
- `users` - User profiles with timezone info
- `teams` - Workspace/team records
- `events` - Activity event log

### Key Lock Fields

| Field | Purpose |
|-------|---------|
| `status` | Current lock status (draft/active/started/blocked/done) |
| `deadline` | When the lock expires |
| `urgency` | Priority level |
| `escalation_chain` | JSON array of escalation levels |
| `escalation_level` | Current escalation level (0-indexed) |
| `last_escalated_at` | Timestamp of last escalation |
| `alert_sent_at` | When 75% alert was sent |
| `reminder_12h_sent` | Boolean for 12h reminder |
| `reminder_3h_sent` | Boolean for 3h reminder |
| `reminder_1h_sent` | Boolean for 1h reminder |

### Event Types

| Event Type | Description |
|------------|-------------|
| `lock.created` | New lock created |
| `lock.started` | Owner started working |
| `lock.completed` | Lock marked done |
| `lock.escalated` | Escalated to next level |
| `lock.alert_sent` | 75% proactive alert sent |
| `lock.reminder_sent` | Deadline reminder sent |
| `lock.expired` | Lock expired without completion |

---

## Development

### Tech Stack
- Next.js (App Router)
- TypeScript
- Slack Bolt SDK
- PostgreSQL (via Drizzle ORM)
- Vercel (deployment)

### Environment Variables
- `SLACK_BOT_TOKEN` - Bot OAuth token
- `SLACK_SIGNING_SECRET` - Request verification
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For AI thread inference
