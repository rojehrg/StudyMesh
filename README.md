<p align="center">
  <img src="public/logo.svg" alt="Attunly" width="60" height="60" />
</p>

<h1 align="center">Attunly</h1>

<p align="center">
  <strong>Micro-tickets for Slack. Get responses, not silence.</strong>
</p>

<p align="center">
  <a href="https://attunly.com">Website</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## The Problem

Async work breaks down when requests go unanswered:
- **"Did they see my message?"** — No visibility into whether someone is working on it
- **"When will I hear back?"** — No deadline, no accountability
- **"Should I follow up?"** — Awkward to ping again, so work stays blocked

## The Solution

**Momentum Locks** — lightweight async accountability embedded in Slack.

Type `/attunly` to create a lock:
- Assign an **owner** who needs to respond
- Set a **deadline** for when you need to hear back
- Owner gets a DM with **Start / Blocked / Done** buttons
- You get notified when status changes

No more wondering. No more waiting.

---

## Features

### Slack-Native
Everything happens in Slack. No context switching, no separate app to check.

### Status Tracking
Owner clicks **Start** when they begin, **Blocked** if stuck, **Done** when complete. You see every update.

### Deadlines
Set clear expectations. Owner sees when you need a response.

### Blocked Flow
When owner clicks **Blocked**, they explain what's in the way. You get notified immediately so you can help unblock.

### Analytics
Dashboard shows completion rates, response times, and team patterns.

---

## How It Works

```
1. Type /attunly in Slack
   → Modal opens

2. Fill in the form
   → Who do you need a response from?
   → What do you need from them?
   → When do you need to hear back?

3. Owner gets a DM
   → Sees your request with action buttons
   → Clicks Start when working on it
   → Clicks Done when complete

4. You stay informed
   → Get notified on status changes
   → No need to follow up manually
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project
- Slack app with slash command

### Installation

```bash
# Clone the repo
git clone https://github.com/rojehrg/studymesh.git
cd studymesh

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
npx drizzle-kit push

# Run development server
npm run dev
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Slack
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Optional: Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Auth** | Supabase Auth |
| **Styling** | Tailwind CSS (Custom coffee palette) |
| **Integrations** | Slack API |
| **Deployment** | Vercel |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Login, signup
│   ├── (dashboard)/            # Main app pages
│   │   ├── dashboard/          # Home with activity
│   │   ├── analytics/          # Lock metrics
│   │   ├── team/               # Team management
│   │   └── settings/           # User settings
│   ├── (onboarding)/           # First-time setup
│   └── api/
│       ├── slack/
│       │   ├── commands/       # /attunly handler
│       │   ├── interactions/   # Button clicks, modals
│       │   └── events/         # Slack events
│       ├── cron/
│       │   └── momentum-locks/ # Deadline reminders
│       └── billing/            # Stripe integration
├── lib/
│   ├── db/                     # Drizzle schema
│   ├── slack/
│   │   └── momentum-lock/      # Lock creation, messages, modals
│   └── analytics/              # Event tracking
└── components/                 # React components
```

---

## Momentum Lock Flow

```
User types: /attunly

1. Modal opens → src/lib/slack/momentum-lock/modal-builder.ts
2. User fills in: Owner, Outcome, Deadline
3. Submit → src/app/api/slack/interactions/route.ts
4. Lock saved to momentum_locks table
5. Owner receives DM with Start/Blocked/Done buttons
6. Button clicks update status and notify requester
7. Cron job sends deadline reminders
```

---

## Design Philosophy

- **Calm over clever** — No visual tricks or attention-grabbing animations
- **Editorial, not SaaS** — Think magazine article, not dashboard
- **Human, not corporate** — Warm neutrals, serif typography

See [ATTUNLY_BRAND_SYSTEM.md](./ATTUNLY_BRAND_SYSTEM.md) for the full design guide.

---

## Deployment

The app is deployed on Vercel with automatic deployments from the `main` branch.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

---

## License

Private - All rights reserved.

---

<p align="center">
  Built for teams that want accountability without micromanagement.
</p>
