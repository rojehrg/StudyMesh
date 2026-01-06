# Attunly

Ask for help in Slack without interrupting the wrong person.

Attunly is a Slack-first tool that reduces the social friction of asking for help at work. Type `/attunly` to get AI-generated, low-pressure messages and suggestions for who to reach out to.

## How It Works

1. Type `/attunly need help with the payments API` in any Slack channel
2. Attunly opens a modal with:
   - Your context (pre-filled)
   - AI-generated message (low-pressure, editable)
   - Suggested teammates (based on expertise, optional)
3. Click "Send" - the message goes as a DM
4. The recipient responds when convenient

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **Database**: PostgreSQL via Supabase
- **ORM**: Drizzle ORM
- **Auth**: Supabase Auth (Email, Google, Slack)
- **Icons**: Phosphor Icons
- **Testing**: Vitest + Playwright

## Features

### Slack Command (Primary Interface)
- **`/attunly`**: The main way to ask for help
- **AI Message Generation**: Creates low-pressure, contextual messages
- **Person Suggestions**: Optional - suggests who might know the answer
- **Inferred Availability**: No manual status setting - signals are inferred

### Web Dashboard (Settings & Onboarding)
- **Profile Setup**: Add your expertise and knowledge areas
- **Team Pods**: Organize into focused groups
- **Meeting Scheduling**: Book time with availability overlap detection
- **Notifications**: View and manage help requests

### Authentication

| Method | Description |
|--------|-------------|
| **Email + Password** | Traditional signup/login |
| **Google OAuth** | One-click sign in |
| **Slack OAuth** | Sign in with Slack (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase Project ([supabase.com](https://supabase.com))
- (Optional) Slack App for notifications

### Environment Setup

Create a `.env.local` file:

```bash
# ===================
# REQUIRED
# ===================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres

# ===================
# SECURITY (Required for production)
# ===================
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET=generate-with-openssl-rand-hex-32
ENCRYPTION_KEY=generate-with-openssl-rand-hex-32

# ===================
# SLACK (Required for /attunly command)
# ===================
SLACK_CLIENT_ID=your-slack-app-client-id
SLACK_CLIENT_SECRET=your-slack-app-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_BOT_TOKEN=xoxb-your-bot-token

# ===================
# AI (Required for message generation)
# ===================
GROQ_API_KEY=your-groq-api-key  # Free at console.groq.com
```

### Generate Secrets

```bash
# Generate ADMIN_SECRET
openssl rand -hex 32

# Generate ENCRYPTION_KEY (for token encryption)
openssl rand -hex 32
```

### Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

### Database Setup

```bash
# Push schema to Supabase
npx drizzle-kit push

# Or run migrations via API (requires ADMIN_SECRET)
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── slack/
│   │       ├── commands/      # /attunly slash command handler
│   │       └── interactions/  # Modal submission handler
│   ├── (auth)/               # Login, signup
│   ├── (dashboard)/          # Settings, notifications
│   └── (onboarding)/         # First-time setup
├── lib/
│   ├── slack/
│   │   ├── verify-signature.ts   # Request verification
│   │   ├── modal-builder.ts      # Block Kit modal
│   │   ├── message-generator.ts  # AI message generation
│   │   └── person-suggester.ts   # Expertise matching
│   ├── ai/
│   │   └── semantic-search.ts    # Groq LLM integration
│   ├── db/                       # Drizzle schema
│   └── notifications/            # DM sending
└── components/                   # React components
```

## Security Features

- **CSRF Protection**: OAuth state validation with secure cookies
- **Token Encryption**: Slack tokens encrypted at rest (AES-256-GCM)
- **Rate Limiting**: Protection on sensitive endpoints
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
- **Input Validation**: Server-side validation on all API routes

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

Quick deploy:
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

## API Routes

### Slack Integration (Primary)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/slack/commands` | POST | Handles `/attunly` slash command |
| `/api/slack/interactions` | POST | Handles modal submissions |
| `/api/auth/slack` | GET | Initiate Slack OAuth |
| `/api/auth/slack/callback` | GET | Slack OAuth callback |
| `/api/slack/oauth` | GET/POST | Connect/disconnect Slack |

### Web Dashboard

| Route | Method | Description |
|-------|--------|-------------|
| `/api/meetings` | GET/POST | List/create meetings |
| `/api/meetings/[id]/rsvp` | POST | RSVP to meeting |
| `/api/pods/[code]/settings` | PATCH | Update pod settings |
| `/api/availability/overlap` | POST | Calculate availability overlap |
| `/api/admin/migrate` | POST | Run database migrations |

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

Private - All rights reserved.

## Support

For issues and feature requests, please use GitHub Issues.
