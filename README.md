# Attunly

The intelligent enablement platform for high-performing B2B teams. Connect employees, close skill gaps, and foster collaboration.

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

### Core Features
- **Smart Matching**: AI-powered skill matching with fuzzy logic ("Tax Recon" = "Tax Reconciliation")
- **Enablement Pods**: Create and join focused team groups with unique invite codes
- **Nudges**: Send contextual help requests to teammates
- **Meeting Scheduling**: Schedule meetings with availability overlap detection
- **Real-time Notifications**: In-app + Slack + Email notifications

### Authentication Methods

| Method | Description |
|--------|-------------|
| **Email + Password** | Traditional signup/login with email verification |
| **Google OAuth** | One-click sign in with Google account |
| **Slack OAuth** | Sign in with Slack workspace account |

### Slack Integration (Optional)

Slack integration enhances the experience with:
- **Direct Message Notifications**: Nudges and meeting invites sent via Slack DM
- **Workspace Context**: Connect your Slack workspace to your organization
- **@Mentions**: Get notified when teammates reach out

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
# SLACK (Optional - for notifications)
# ===================
SLACK_CLIENT_ID=your-slack-app-client-id
SLACK_CLIENT_SECRET=your-slack-app-client-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
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
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, signup, forgot-password
│   ├── (dashboard)/       # Protected routes (dashboard, settings, etc.)
│   ├── (onboarding)/      # First-time user flow
│   ├── (legal)/           # Privacy policy, terms
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn UI primitives
│   └── ...               # Feature components
├── lib/                   # Utilities
│   ├── db/               # Drizzle schema
│   ├── supabase/         # Supabase clients
│   ├── logic/            # Matching algorithm
│   └── notifications/    # Notification service
└── hooks/                # Custom React hooks
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

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/slack` | GET | Initiate Slack OAuth |
| `/api/auth/slack/callback` | GET | Slack OAuth callback |
| `/api/slack/oauth` | GET/POST | Connect/disconnect Slack |
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
