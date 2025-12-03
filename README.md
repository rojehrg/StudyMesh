# Meshflow (Next.js Rewrite)

The intelligent enablement platform for high-performing B2B teams. Built with the "Perfect Stack" for Vercel deployment.

## Tech Stack

*   **Framework**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
*   **Backend**: Supabase (Auth + Postgres)
*   **ORM**: Drizzle ORM
*   **Logic**: Custom TypeScript Matching Engine (Fuzzy Logic)

## Getting Started

### 1. Prerequisites

*   Node.js 18+
*   A Supabase Project (Free Tier is fine)

### 2. Environment Setup

Create a `.env.local` file in the root:

```bash
NEXT_PUBLIC_SUPABASE_URL="your-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgresql://postgres:[password]@[host]:6543/postgres"
```

### 3. Install & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Database Migration

To push the schema to your Supabase instance:

```bash
npx drizzle-kit push
```

## Features

*   **Smart Matching**: Matches employees based on skill gaps ("Tax Recon" ≈ "Tax Reconciliation").
*   **Enablement Pods**: Create and join focused groups.
*   **Command Center**: Visual network graph of team connections.
*   **Sleek UI**: Animated landing page with "glassmorphism" aesthetic.

## Deployment (Vercel)

1.  Push to GitHub.
2.  Import project in Vercel.
3.  Add Environment Variables (Supabase keys).
4.  Deploy.

## Legacy Code

The original Reflex (Python) prototype is archived in the `legacy/` directory for reference.
