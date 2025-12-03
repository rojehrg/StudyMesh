
# Meshflow - B2B Enablement Plan

## Project Overview
Meshflow is a B2B enablement hub that pairs employees based on role goals, skills gaps, availability, and training interests. Instead of “classes,” organizations set up collaboration pods where specialists and learners can support each other. The objective is to keep internal knowledge circulating, reduce onboarding time, and uncover training needs.

## Architecture Overview
- **Stack**: Reflex (full Python) with Supabase PostgreSQL.
- **Domain vocabulary**: Organizations → Enablement Pods → Employees → Pairings & Working Sessions.
- **Integrations** (future): Slack / Teams for nudges, HRIS import for employee roster, optional AI summarizer.

---

## Phase 1: Org Onboarding & Authentication ✅
- [x] Auth flow with email/password + bcrypt.
- [x] Org-scoped data (tenant-aware sessions using `org_id` in JWT payload).
- [x] Dashboard shell with side navigation (Pods, Team Directory, Training Hub, Settings).

## Phase 2: Employee Profile Model (Created)
- Fields now represent B2B context instead of student data:
  - Role Title & Department
  - Key Skills (multi-select tags)
  - Skills to Grow / “Needs Help With”
  - Mentor Availability windows
  - Timezone & Preferred Collaboration Mode (async, live session, hybrid)
  - Bio + Current Projects
- Logistics section retained for scheduling, but copy references “meeting blocks” instead of class availability.

## Phase 3: Enablement Pod Management
- Rename “Classes” to “Pods” throughout UI and API.
- Pod creation fields: Pod Name, Business Unit, Initiative Owner, Fiscal Quarter, KPI focus.
- Join flow uses pod codes (similar to class codes) but references “Enablement Pod Code” in placeholders.
- Micro groups become “Working Circles” with templates (shadowing, peer review, workshop prep).

## Phase 4: Matching & Recommendations (Planned)
- Replace academic compatibility weights with:
  - Skill Gap Alignment (mentor skill intersects mentee gap)
  - Department cross-pollination score
  - Initiative alignment (same pod goal)
  - Availability overlap
  - Collaboration preference match (async/live)
- Outputs:
  - “Offer Support” queue (people who can mentor)
  - “Request Support” queue (people needing help)
  - Suggested Working Circles (3-4 people) for specific initiatives.

## Phase 5: Enablement Timeline & Sessions (Future)
- Session logging: capture date, attendees, topics, outcomes.
- Nudges to schedule follow-ups (email/slack integration placeholder).
- Reporting dashboards: coverage of skills, open requests, mentor workload.

---

## Technical Notes

### Authentication & OAuth
- **Email/Password Auth**: Implemented with bcrypt password hashing (currently mocked for demo)
- **Google OAuth**: Gmail OAuth via Supabase configured (see `SUPABASE_OAUTH_SETUP.md`)
  - Requires Google Cloud Console OAuth credentials
  - Supabase handles OAuth flow and token management
  - Redirect URL: `https://[project-ref].supabase.co/auth/v1/callback`
- **Session Management**: JWT tokens stored in state (tenant-aware with `org_id`)

### Database Connection & Schema Management
- **Connection**: Supabase PostgreSQL via Session Pooler (IPv4 compatible)
- **Connection String**: Stored in `.env` as `REFLEX_DB_URL`
- **Schema Viewing**: 
  - **Dashboard**: Supabase Dashboard → Table Editor (visual)
  - **SQL Editor**: Query `information_schema.columns` for table structure
  - **Migration Files**: `alembic/versions/` contains schema history
  - See `SUPABASE_SCHEMA_GUIDE.md` for detailed instructions
- **Migrations**: Managed via Alembic (`reflex db makemigrations`, `reflex db migrate`)

### Database Entities (Supabase PostgreSQL)
```
organizations: id, name, domain, settings
users: id, org_id, email, password_hash, full_name, role_title, department,
       timezone, mentorship_availability (JSON), preferred_mode, bio, projects, created_at
skills: id, org_id, label
user_skills: user_id, skill_id (type='expertise'|'growth')
pods: id, org_id, pod_code, name, business_unit, initiative_owner, quarter, kpi_focus, created_by
pod_members: id, pod_id, user_id, joined_at, role_in_pod (mentor|learner|lead)
working_circles: id, pod_id, name, description, goal, created_by
working_circle_members: circle_id, user_id
compatibility_scores: id, pod_id, user_a_id, user_b_id, score, breakdown (JSON)
support_requests: id, requester_id, skill_needed, context, status, created_at
session_logs: id, circle_id (nullable), pod_id, facilitator_id, date, summary, action_items JSON
```

### Matching Signals (Draft Weights)
- Skill Gap match: 0–30 pts (mentor skill intersects mentee gap).
- Department Diversity Bonus: 0–10 pts (different departments).
- Initiative Alignment: 0–20 pts (same pod KPI).
- Availability Overlap: 0–15 pts (common windows).
- Collaboration Style: 0–10 pts (async vs live).
- Business Unit Proximity: 0–10 pts (optional bonus if same BU needed).
- Soft Match Bonus: 0–5 pts (shared projects or goals).

### UI/UX Implementation Notes
- **Input Text Color**: Explicitly set to `#111827` (black) in global CSS to prevent gray text
- **Landing Page**: Professional B2B-focused landing page at `/landing` route
  - Hero section with value proposition
  - Feature highlights (Smart Matching, Enablement Pods, Working Circles)
  - "How It Works" section (4-step process)
  - CTA sections and footer
  - Accessible via Meshflow logo click (top-left)
- **Navigation**: 
  - Root route (`/`) shows landing page
  - Dashboard route (`/dashboard`) for authenticated users
  - Logo/branding clickable to return to landing page
- **OAuth UI**: "Sign in with Google" buttons added to login/signup forms
  - Requires Supabase OAuth configuration (see setup guide)
  - Graceful fallback if OAuth not configured

---

## Copy & Branding Checklist
- Rename product branding to **Meshflow** everywhere (logo text, headers, login copy).
- Replace “Class / Student / Study” with “Pod / Employee / Enablement”.
- Update placeholders (e.g., “e.g. Pod Code AB12CD”, “Describe current projects”).
- Logistics verbiage: “Meeting Availability” instead of “Weekly Availability”.
- About/FAQ page copy to emphasize B2B training enablement.

---

## Immediate Next Steps
1. Finish Supabase connection & baseline migrations (done).
2. Update UI text placeholders + section titles to the new naming.
3. Backfill existing mock data with B2B-friendly defaults.
4. Iterate on the compatibility algorithm once sample org data is seeded.
