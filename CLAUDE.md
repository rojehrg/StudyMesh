# CLAUDE.md

This file provides context for Claude when working on the Attunly codebase.

## Project Overview

**Attunly** is a Slack-first micro-ticket system for teams. The core feature is **Momentum Locks** - lightweight async accountability requests embedded in Slack.

Key feature:
- **Momentum Locks** - Request responses from teammates with deadlines, track status (Start → Blocked → Done), and get notifications

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL + Auth)
- **ORM:** Drizzle
- **Styling:** Tailwind CSS with custom coffee color palette
- **UI Components:** Radix UI primitives
- **Payments:** Stripe
- **Testing:** Vitest + Playwright

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/     # Authenticated app pages
│   │   ├── dashboard/   # Main dashboard
│   │   ├── analytics/   # Lock analytics
│   │   ├── team/        # Team management
│   │   └── settings/    # User settings
│   ├── (auth)/          # Login/signup flows
│   ├── (onboarding)/    # New user onboarding
│   ├── api/             # API routes
│   │   ├── slack/       # Slack webhooks, commands, interactions
│   │   ├── cron/        # Momentum lock reminders
│   │   └── billing/     # Stripe integration
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Radix-based primitives
│   └── loading-states.tsx
├── lib/
│   ├── supabase/        # Supabase client (server/client)
│   ├── slack/           # Slack API helpers
│   │   └── momentum-lock/  # Lock creation, messages, modals
│   ├── db/              # Drizzle schema and queries
│   └── rbac.ts          # Role-based access control
```

## Brand Guidelines

**CRITICAL:** Follow `ATTUNLY_BRAND_SYSTEM.md` for all UI work.

Key rules:
- **Coffee color palette only** - No blue, green, red, or purple
- **No icons** except Slack logo and mesh mark
- **No emojis** in UI or copy
- **Serif typography** (Source Serif 4)
- **Calm, editorial feel** - Not typical SaaS

Color reference:
```
coffee-espresso: #1a1614  (primary text, buttons)
coffee-cortado:  #6b5d54  (body text)
coffee-latte:    #8c7b70  (muted text)
coffee-foam:     #e8e2dc  (borders)
coffee-cream:    #f6f3f0  (alt backgrounds)
coffee-paper:    #fffcf9  (primary background)
```

## Common Patterns

### API Routes
```typescript
// Always check auth first
const context = await getUserOrgContext();
if (!context) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Supabase Queries
```typescript
// Server-side
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client-side
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

### Loading States
```typescript
import { PageLoader, CardSkeleton } from '@/components/loading-states';
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run Vitest tests
npm run test:e2e     # Run Playwright tests
```

## Key Files

- `src/app/api/slack/commands/route.ts` - `/attunly` slash command (opens lock modal)
- `src/app/api/slack/interactions/route.ts` - Button clicks, modal submissions
- `src/lib/slack/momentum-lock/` - Lock creation, messages, inference, modals
- `src/lib/db/schema/index.ts` - Database schema (momentum_locks, momentum_lock_events)
- `src/lib/rbac.ts` - Auth context and permissions

## Database

Key tables:
- `momentum_locks` - Lock records (owner, requester, deadline, status)
- `momentum_lock_events` - Event log (started, blocked, done)
- `profiles` - User profiles with Slack ID, timezone

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`
- `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
