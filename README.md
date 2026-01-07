# Attunly

Find the right person to ask. Remove the friction of reaching out.

## What It Does

**Problem:** At work, you often don't know who to ask for help, what their schedule looks like, or how to reach out without being awkward.

**Solution:** Attunly maintains a lightweight profile of who knows what, connects to calendars for real availability, and provides a Slack command to find and message the right person.

## How It Works

### 1. Set Up Your Profile (Web)
- Sign up at attunly.com
- Describe what you know and can help with (natural language)
- Connect your Google Calendar

### 2. Use `/attunly` in Slack
```
/attunly need help with React hooks, anyone free in 10 mins?
```
- Attunly searches your org's profiles
- Shows who matches + their availability
- Sends a low-pressure message or schedules a meeting

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Coffee palette
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth (Email, Google, Slack)
- **Integrations**: Slack API, Google Calendar API, Zoom
- **AI**: Groq/GPT for matching

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase Project
- Slack App (for `/attunly` command)
- Google Cloud Project (for Calendar)

### Environment Setup

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security
ADMIN_SECRET=openssl-rand-hex-32
ENCRYPTION_KEY=openssl-rand-hex-32

# Slack
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# AI
GROQ_API_KEY=your-groq-api-key
```

### Install & Run

```bash
npm install
npm run dev
```

### Database

```bash
npx drizzle-kit push
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel deployment instructions.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── slack/           # /attunly command + interactions
│   │   ├── auth/            # OAuth handlers
│   │   ├── calendar/        # Google Calendar integration
│   │   └── meetings/        # Meeting scheduling
│   ├── (auth)/              # Login, signup pages
│   ├── (dashboard)/         # Main app pages
│   └── (onboarding)/        # First-time setup
├── lib/
│   ├── slack/               # Slack utilities
│   ├── db/                  # Database schema
│   └── meeting-providers/   # Zoom integration
└── components/              # React components
```

## License

Private - All rights reserved.
