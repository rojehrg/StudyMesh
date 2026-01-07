<p align="center">
  <img src="public/logo.svg" alt="Attunly" width="60" height="60" />
</p>

<h1 align="center">Attunly</h1>

<p align="center">
  <strong>Find the right person to ask. Remove the friction of reaching out.</strong>
</p>

<p align="center">
  <a href="https://attunly.com">Website</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## The Problem

At work, asking for help is harder than it should be:
- **"Who knows this?"** — You're stuck and don't know who to ask
- **"Are they free?"** — Calendars don't tell you if it's okay to interrupt
- **"How do I phrase this?"** — The message sits in the text box, unsent

The question never gets asked. The work stays blocked.

## The Solution

Attunly creates a lightweight layer of "who knows what" and "when are they free" that sits on top of your existing tools.

**Web App** — Create a profile describing your expertise in natural language. Connect your Google Calendar.

**Slack Command** — Type `/attunly [what you need]` and get matched with someone who can help, see their availability, and send a low-pressure message.

---

## Features

### Natural Language Profiles
Describe what you know in your own words. No checkboxes, no skill matrices.

> "I'm good at React hooks, debugging CSS issues, and explaining webpack configs"

### AI-Powered Matching
Using Groq's LLM, Attunly semantically matches help requests to expertise profiles—not just keyword matching.

### Real Availability
Connect Google Calendar to show actual free time, not just "online" status.

### Low-Friction Messaging
Generates calm, low-pressure message drafts. Edit or send as-is.

### Meeting Scheduling
Book time directly through Attunly with Zoom or Google Meet integration.

---

## How It Works

```
1. Create your profile (2 min)
   → Sign up at attunly.com
   → Describe what you can help with
   → Connect Google Calendar

2. Use /attunly in Slack
   → /attunly need help with the payments API
   → See who matches + their availability
   → Send a DM or schedule a meeting
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase project
- Slack app with slash command
- Google Cloud project (Calendar API)
- Groq API key (free tier available)

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

# Security
ADMIN_SECRET=your-admin-secret
ENCRYPTION_KEY=your-32-char-encryption-key

# Slack
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI Matching
GROQ_API_KEY=your-groq-api-key

# Optional: Zoom
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle ORM |
| **Auth** | Supabase Auth (Email, Google, Slack OAuth) |
| **Styling** | Tailwind CSS (Custom coffee palette) |
| **AI** | Groq (Llama 3.1) for semantic matching |
| **Integrations** | Slack API, Google Calendar API, Zoom API |
| **Deployment** | Vercel |
| **Analytics** | PostHog |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Login, signup, forgot-password
│   ├── (dashboard)/            # Main app pages
│   │   ├── dashboard/          # Home dashboard
│   │   ├── find-help/          # Search for expertise
│   │   ├── meetings/           # Scheduled meetings
│   │   ├── settings/           # User settings
│   │   └── notifications/      # Nudges and alerts
│   ├── (onboarding)/           # First-time setup flow
│   └── api/
│       ├── slack/              # Slash command + interactions
│       │   ├── commands/       # /attunly handler
│       │   └── interactions/   # Modal submissions
│       ├── auth/               # OAuth callbacks
│       ├── calendar/           # Google Calendar integration
│       ├── meetings/           # Meeting CRUD
│       ├── availability/       # Overlap calculation
│       └── find-help/          # AI-powered search
├── lib/
│   ├── db/                     # Drizzle schema
│   ├── slack/                  # Modal builder, message generator
│   ├── ai/                     # Semantic search
│   └── meeting-providers/      # Zoom integration
└── components/                 # React components
```

---

## Slack Command Flow

```
User types: /attunly need help with React hooks

1. Command received → src/app/api/slack/commands/route.ts
2. AI generates message draft → src/lib/slack/message-generator.ts
3. Person suggestions fetched → src/lib/slack/person-suggester.ts
4. Modal opens with form
5. User submits → src/app/api/slack/interactions/route.ts
6. DM sent to recipient
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
  Built with care for teams that want to help each other.
</p>
