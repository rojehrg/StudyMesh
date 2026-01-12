# Attunly - Product Overview

## What is Attunly?

Attunly is a **Slack-first platform** that helps teams find and reach the right person to ask for help. It solves three common workplace problems:

1. **"Who knows this?"** - You're stuck and don't know who to ask
2. **"Are they free?"** - Calendars don't tell you if it's okay to interrupt
3. **"How do I phrase this?"** - The message sits unsent because asking feels awkward

Attunly creates a lightweight layer of "who knows what" and "when are they free" on top of Slack, making it easy to find help without the social friction.

---

## Core Philosophy

- **Slack-first**: Everything happens in Slack. The web app is just for setup.
- **Low friction**: Reduce the barriers to asking for help
- **AI-assisted**: Smart matching and message generation, not manual skill matrices
- **Calm UX**: Editorial feel, not typical SaaS dashboards

---

## Features

### 1. Ask for Help (`/attunly`)

The primary feature. Type `/attunly [what you need]` in any Slack channel or DM.

**What happens:**
1. Modal opens in Slack
2. Shows AI-suggested people who can help (based on expertise matching)
3. Shows their availability (from Google Calendar)
4. Pre-generates a low-pressure message draft
5. User edits and sends
6. Recipient gets a DM with clear sender attribution and a "Reply" button

**AI Features:**
- **Semantic matching**: Uses Groq (Llama 3.1) to match your request to people's expertise descriptions
- **Message generation**: Creates calm, low-pressure message drafts
- **Lingo translation**: If sender and recipient are in different departments, translates jargon (e.g., "sprint velocity" → "how fast the team ships")

**Example:**
```
/attunly need help debugging a React useEffect infinite loop
```
→ Modal shows 3 people with React expertise, their availability, and a suggested message.

---

### 2. Momentum Locks (`/attunly lock`)

For urgent, time-sensitive handoffs across timezones. Creates a trackable commitment with automatic escalation.

**What happens:**
1. User types `/attunly lock`
2. Modal opens with fields:
   - **Owner**: Who needs to deliver
   - **Outcome**: What needs to happen (one clear sentence)
   - **Deadline**: When it's needed (2hrs, 4hrs, tomorrow, etc.)
   - **Fallback** (optional): Backup person if owner is blocked
   - **Acceptable fallback** (optional): What's okay if full delivery isn't possible
3. On submit:
   - Lock is saved to database
   - Owner receives a DM with full context and action buttons

**Owner's DM includes:**
- What's needed
- Deadline with countdown
- Three buttons:
  - **Start** - "I'm working on it"
  - **Blocked** - Opens options (need input, partial delivery, rescope, escalate)
  - **Done** - Mark complete

**Blocked options:**
- "I need input from someone else"
- "I can ship a partial version"
- "This should be re-scoped"
- "I can't touch this before fallback wakes up" (triggers immediate escalation)

**Automatic escalation:**
- Daily cron job runs at 9am
- Sends wake-up DMs to owners who haven't started
- If deadline approaching and no response, escalates to fallback owner

**Use case:**
Team in SF needs designer in London to review mockups before standup. Create a Momentum Lock → Designer wakes up to a clear DM with exactly what's needed and when.

---

### 3. Nudge Notifications

Internal system for sending help requests or offers between users.

**Types:**
- **Ask nudge**: "Can you help me with X?"
- **Offer nudge**: "I can help you with X"

**Delivery:**
1. Tries Slack DM first (if user has connected Slack)
2. Falls back to email if Slack unavailable
3. Legacy webhook fallback for channel notifications

---

### 4. Natural Language Profiles

Users describe their expertise in their own words, not checkboxes.

**Example profile:**
> "I'm good at React hooks, debugging CSS issues, and explaining webpack configs. Happy to help with code reviews anytime."

This text is semantically searched when someone uses `/attunly`.

**Additional fields:**
- Department (for lingo translation)
- Knowledge areas (tags for keyword matching)
- Google Calendar connection (for availability)

---

### 5. AI-Powered Matching

When someone asks for help, Attunly finds the best matches using:

1. **Semantic search**: Groq compares the request to expertise descriptions
2. **Keyword matching**: Checks knowledge area tags
3. **Availability hints**: Shows "Available now" or "Has open hours"
4. **Department context**: Factors in cross-team dynamics

---

### 6. Lingo Translation

Automatically translates departmental jargon when sender and recipient are in different departments.

**Example:**
- Engineering asks Sales: "need help with CRM integration"
- Attunly shows: "They might call this 'Salesforce sync' or 'pipeline automation'"

Uses organization-specific terminology glossary if configured.

---

### 7. Google Calendar Integration

Connect Google Calendar to show real availability:
- "Available now" badge
- "Has open hours today" indicator
- Helps requesters know if it's a good time to reach out

---

## Web App Pages

The web app is primarily for setup and admin. Key pages:

| Page | Purpose |
|------|---------|
| `/dashboard` | Status overview, connection cards, recent activity |
| `/settings` | Profile, integrations (Slack, Google Calendar), preferences |
| `/team` | View team members and their expertise |
| `/find-help` | Web-based search (backup to Slack command) |

---

## Slack Commands Summary

| Command | What it does |
|---------|--------------|
| `/attunly [context]` | Find someone to help, send AI-drafted message |
| `/attunly lock` | Create time-bound commitment with escalation |

---

## User Journey

### First-time setup (2 min)
1. Sign up at attunly.com (email, Google, or Slack)
2. Describe what you can help with
3. Connect Google Calendar (optional but recommended)
4. Connect Slack

### Daily use
1. Need help? Type `/attunly [what you need]` in Slack
2. Pick a person, edit message if needed, send
3. They get a DM, you get confirmation
4. They reply directly in Slack

### Urgent handoffs
1. Type `/attunly lock`
2. Assign owner, outcome, deadline
3. They wake up to a clear action item
4. Track status via Start/Blocked/Done buttons

---

## Technical Architecture

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL (Supabase) |
| ORM | Drizzle |
| Auth | Supabase Auth |
| AI | Groq (Llama 3.1) |
| Integrations | Slack API, Google Calendar API |
| Hosting | Vercel |

---

## Key Differentiators

1. **Slack-native**: Not another app to check. Lives where work happens.
2. **AI-first matching**: No manual skill matrices to maintain.
3. **Low-pressure messaging**: Generated drafts reduce anxiety around asking.
4. **Timezone-aware**: Momentum Locks solve async handoff pain.
5. **Calm design**: Editorial feel, not enterprise software aesthetics.

---

## Target Users

- **Remote/hybrid teams** struggling with "who knows what"
- **Cross-functional teams** with communication gaps between departments
- **Globally distributed teams** needing reliable async handoffs
- **Growing startups** where institutional knowledge isn't documented

---

## Pricing

- **Free tier**: Core features for small teams
- **Pro tier**: Advanced features, higher limits
- **Enterprise**: Custom integrations, SSO, admin controls

(See `/pricing` page for current details)
