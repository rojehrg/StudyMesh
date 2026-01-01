# StudyMesh / Attunly - Project Summary

**Last Updated:** January 2025  
**Status:** Production-ready, deployed to Vercel

---

## 🎯 What This Project Is

**Attunly** (formerly StudyMesh) is an intelligent B2B team enablement platform that helps organizations:
- **Close knowledge gaps** by matching employees based on skill expertise and growth areas
- **Enable collaboration** through contextual nudges and "Looking to Help" status
- **Organize teams** with "Pods" (focused groups by project/department)
- **Track engagement** with compatibility scores and match insights

**Core Philosophy:** Human-centric matching with algorithm-assisted discovery. Users manually select skills when nudging, bypassing keyword matching issues.

---

## 🚀 Deployment & Infrastructure

### GitHub Repository
- **URL:** `https://github.com/rojehrg/studymesh.git`
- **Branch:** `main` (production)
- **Status:** Active, synced with Vercel

### Vercel Deployment
- **Platform:** Vercel (Next.js optimized)
- **Status:** Deployed and live
- **Environment Variables Required:**
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `DATABASE_URL` (Postgres connection string via Supabase Transaction Pooler)

### Supabase Backend
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Supabase Auth (Email + Google OAuth)
- **Connection:** Transaction Pooler on port 6543
- **Project URL:** `https://yrpiyqiocdfbwwtlktgu.supabase.co`

### Database Migrations
- **Tool:** Drizzle Kit
- **Location:** `drizzle/` directory
- **Latest Migration:** `0003_clear_the_liberteens.sql`
- **Command:** `npx drizzle-kit push`

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.0.6 (App Router)
- **Language:** TypeScript (strict mode)
- **UI Library:** React 19.2.0
- **Styling:** 
  - Tailwind CSS 3.4.1
  - Shadcn UI components (Radix UI primitives)
  - Framer Motion 12.23.25 (animations)
- **Icons:** Lucide React

### Backend
- **Database:** Supabase PostgreSQL
- **ORM:** Drizzle ORM 0.44.7
- **Auth:** Supabase Auth (SSR-compatible)
- **API Routes:** Next.js API routes (serverless functions)

### Key Libraries
- `string-similarity` - Fuzzy matching algorithm
- `sonner` - Toast notifications
- `next-themes` - Dark mode support
- `class-variance-authority` - Component variants

---

## 📁 Project Structure

```
studymesh/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth routes (login, signup)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── classes/       # Pod management (create, join, view)
│   │   │   ├── groups/        # Working circles / matches
│   │   │   ├── notifications/ # Nudge notifications
│   │   │   ├── settings/      # User settings
│   │   │   └── about/         # About page
│   │   ├── (onboarding)/      # First-time user onboarding
│   │   ├── api/               # API routes
│   │   │   └── slack/         # Slack webhook integration
│   │   └── auth/              # Auth callback handlers
│   ├── components/            # React components
│   │   ├── ui/                # Shadcn UI components
│   │   ├── onboarding/        # Onboarding flow components
│   │   ├── dashboard-layout.tsx
│   │   └── nudge-dialog.tsx
│   ├── lib/                   # Business logic & utilities
│   │   ├── db/                # Database setup & schema
│   │   ├── supabase/          # Supabase client utilities
│   │   ├── logic/             # Matching algorithm
│   │   └── constants/         # Popular skills list
│   └── hooks/                 # Custom React hooks
├── drizzle/                   # Database migrations
├── public/                    # Static assets
├── specs/                     # Feature specifications
└── legacy/                    # Original Reflex (Python) prototype
```

---

## 🗄 Database Schema

### Tables

1. **`profiles`** - User profiles with skills, preferences, availability
   - `userId` (UUID, unique) - Links to Supabase Auth
   - `expertiseSkills` (text[]) - Skills user can teach
   - `growthSkills` (text[]) - Skills user wants to learn
   - `expertiseLevels` (JSONB) - Skill proficiency (0-100)
   - `growthLevels` (JSONB) - Growth skill proficiency
   - `lookingToHelp` (boolean) - Active mentoring status
   - `availability` (JSONB) - Time availability grid
   - `slackHandle` (text) - Slack integration

2. **`pods`** - Focused groups (projects, departments, initiatives)
   - `podCode` (text, unique) - Join code
   - `podName` (text) - Display name
   - `businessUnit` (text) - Department/unit
   - `initiativeOwner` (text) - Owner/manager

3. **`podMembers`** - Many-to-many: users ↔ pods
   - `podId` (UUID) → `pods.id`
   - `userId` (UUID)

4. **`compatibilityScores`** - Pre-calculated match scores
   - `podId` (UUID)
   - `userAId`, `userBId` (UUID)
   - `score` (integer, 0-100)
   - `scoreBreakdown` (JSONB) - Detailed match reasons

5. **`notifications`** - Nudge notifications
   - `recipientId`, `senderId` (UUID)
   - `type` (text) - 'nudge', 'system', etc.
   - `content` (text)
   - `metadata` (JSONB) - Additional context
   - `read` (boolean)

6. **`openRequests`** - Skill help requests
   - `userId` (UUID)
   - `skill` (text)
   - `status` (text) - 'open', 'notified', 'closed'

---

## ✨ Implemented Features

### ✅ Core Features

1. **Authentication**
   - Email/password signup & login
   - Google OAuth integration
   - Supabase Auth with SSR
   - Email confirmation (can be disabled)

2. **User Profiles**
   - Onboarding flow for new users
   - Skill entry (expertise + growth areas)
   - Proficiency levels (0-100) with visual rings
   - Availability grid (days + time slots)
   - "Looking to Help" toggle
   - Department, bio, preferences

3. **Smart Matching Algorithm**
   - Fuzzy string matching (`string-similarity` library)
   - Handles variations: "Tax Recon" ≈ "Tax Reconciliation"
   - Multi-factor scoring:
     - Skill gap (30 points max)
     - Department diversity (10 points)
     - Initiative alignment (20 points)
     - Availability overlap (15 points)
     - Collaboration style (10 points)
     - Business unit alignment (10 points)
     - Shared projects (5 points)
     - Reliability score (15 points)
   - Location: `src/lib/logic/matching.ts`

4. **Pods (Classes/Groups)**
   - Create pods with unique join codes
   - Join pods via code
   - View pod members
   - Pod-specific matching
   - Business unit organization

5. **Nudges**
   - Send contextual help requests
   - Offer help proactively
   - Skill-specific nudging (manual selection)
   - Notification system
   - Nudge history tracking

6. **Dashboard**
   - Main dashboard with stats
   - Working circles (match view)
   - Pod management
   - Notifications center
   - Settings page

7. **UI/UX**
   - Modern landing page with animations
   - Glassmorphism design aesthetic
   - Responsive design (mobile-first)
   - Framer Motion animations
   - Shadcn UI component library
   - Toast notifications

### 🔌 Integrations

1. **Slack Integration**
   - Webhook endpoint: `/api/slack/nudge`
   - Sends nudges to Slack channels
   - Location: `src/app/api/slack/nudge/route.ts`

---

## 📋 Recent Changes (Git History)

1. **Slack webhook, open requests, proficiency rings, nudge history, animated blobs**
2. **Email signup fix:** Auto-login when email confirmation disabled
3. **Vercel build fixes:** Dynamic rendering, env var handling
4. **Next.js rewrite complete:** Migrated from Reflex (Python) to Next.js

---

## 🎨 Design Philosophy

### Matching Philosophy
- **Human-centric:** Algorithm assists discovery, but users make final connection decisions
- **Manual skill selection:** When nudging, users pick specific skills (bypasses keyword issues)
- **"Looking to Help" status:** Makes experts discoverable
- **No AI dependency:** Fuzzy matching is sufficient, explainable, trustworthy

See `docs/MATCHING_PHILOSOPHY.md` for full details.

### UI Philosophy
- Compact, scannable cards
- Skill badges with preview (first 4, then "+3")
- One-click actions
- Clear visual hierarchy
- Teal/cyan color system

---

## 🚦 Current Status

### ✅ Production Ready
- Deployed to Vercel
- Database migrations applied
- Authentication working
- Core features implemented
- Slack integration active

### 📝 Specs Available
- `specs/003-design-overhaul/` - Design improvements
- `specs/004-core-features/` - Core feature specs
- `specs/005-qol-improvements/` - Quality of life improvements
- `specs/006-slack-nudges-proficiency/` - Slack & proficiency features

### 🔄 Legacy Code
- Original Reflex (Python) prototype in `legacy/` directory
- Kept for reference only
- Not actively maintained

---

## 🛠 Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Run production server
npm start

# Database migrations
npx drizzle-kit push

# Lint
npm run lint
```

---

## 🔐 Environment Variables

Required in `.env.local` (local) or Vercel dashboard (production):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yrpiyqiocdfbwwtlktgu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Note:** `DATABASE_URL` must use Transaction Pooler port `6543`, not direct connection port `5432`.

---

## 📚 Key Documentation Files

- `README.md` - Quick start guide
- `DEPLOYMENT.md` - Vercel deployment instructions
- `docs/MATCHING_PHILOSOPHY.md` - Matching algorithm philosophy
- `docs/DISABLE_EMAIL_CONFIRMATION.md` - Auth configuration
- `PROJECT_SUMMARY.md` - This file

---

## 🎯 Next Steps / Known Areas for Improvement

1. **Testing**
   - Unit tests for matching algorithm
   - Integration tests for API routes
   - E2E tests for critical flows

2. **Performance**
   - Optimize compatibility score calculations
   - Add caching for match results
   - Database query optimization

3. **Features** (from specs)
   - Design overhaul improvements
   - Quality of life enhancements
   - Additional Slack integrations

4. **Monitoring**
   - Error tracking (Sentry, etc.)
   - Analytics
   - Performance monitoring

---

## 💡 Key Insights for Development

1. **Matching is supplementary** - Algorithm ranks matches, but users make final decisions
2. **Manual skill selection** - Solves keyword matching issues elegantly
3. **"Looking to Help" is powerful** - Makes experts discoverable
4. **No AI needed** - Fuzzy matching + human judgment works great
5. **Enterprise-ready** - Privacy-conscious, explainable, fast

---

## 🔗 Important Links

- **GitHub:** https://github.com/rojehrg/studymesh
- **Vercel Dashboard:** (Check your Vercel account)
- **Supabase Dashboard:** https://supabase.com/dashboard/project/yrpiyqiocdfbwwtlktgu

---

**This project is actively maintained and ready for production use.**



