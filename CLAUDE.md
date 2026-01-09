# CLAUDE.md

This file provides context for Claude when working on the Attunly codebase.

## Project Overview

**Attunly** is a Slack-first expertise finder for teams. Users connect Slack, describe their expertise, and the app matches people who need help with people who can provide it.

Key features:
- **Find Help** - AI-powered search to find teammates with relevant expertise
- **Knowledge Graph** - Visual network of team expertise and connections
- **Lingo Translation** - Translates departmental jargon between teams (e.g., Sales → Engineering)
- **Slack Integration** - `/attunly` command for finding help directly in Slack

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL + Auth)
- **ORM:** Drizzle
- **Styling:** Tailwind CSS with custom coffee color palette
- **UI Components:** Radix UI primitives
- **Animation:** Framer Motion (minimal usage)
- **AI:** Groq (free tier) for semantic search and lingo translation
- **Payments:** Stripe
- **Testing:** Vitest + Playwright

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/     # Authenticated app pages
│   │   ├── dashboard/   # Main dashboard
│   │   ├── find-help/   # AI expertise search
│   │   ├── groups/      # Knowledge graph view
│   │   ├── team/        # Team management
│   │   └── settings/    # User settings
│   ├── (auth)/          # Login/signup flows
│   ├── (onboarding)/    # New user onboarding
│   ├── api/             # API routes
│   │   ├── slack/       # Slack webhooks & commands
│   │   ├── graph/       # Knowledge graph data
│   │   ├── find-help/   # Search API
│   │   └── billing/     # Stripe integration
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Radix-based primitives
│   ├── knowledge-graph/ # Graph visualization
│   └── loading-states.tsx
├── lib/
│   ├── supabase/        # Supabase client (server/client)
│   ├── ai/              # Groq integrations
│   │   ├── semantic-search.ts
│   │   └── lingo-translator.ts
│   ├── slack/           # Slack API helpers
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

- `src/lib/ai/lingo-translator.ts` - Cross-department jargon translation
- `src/lib/ai/semantic-search.ts` - AI-powered expertise matching
- `src/app/api/slack/commands/route.ts` - Slack slash command handler
- `src/app/api/graph/route.ts` - Knowledge graph data API
- `src/lib/rbac.ts` - Auth context and permissions

## Database

Profiles table key fields:
- `user_id`, `organization_id`
- `first_name`, `last_name`
- `department`, `major`
- `expertise_text` - Free-form expertise description
- `knowledge_areas` - Array of skill tags
- `availability` - JSONB with `currentlyAvailable` boolean

## Testing Seeds

```bash
npx tsx scripts/seed-test-users.ts  # Add fake users for testing
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY` (for AI features)
- `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
