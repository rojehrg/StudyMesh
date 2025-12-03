# Meshflow Implementation Plan V2

## Issues to Fix

### 1. OAuth Redirect Issue ✅
- **Problem**: After Google OAuth, redirects to landing page instead of dashboard
- **Solution**: Add OAuth callback handler that processes Supabase session and redirects to `/dashboard`

### 2. Landing Page Redesign ✅
- **Problem**: Current landing page looks unprofessional
- **Solution**: Create modern B2B SaaS landing page inspired by top templates (Linear, Notion, Vercel style)
- **Features**:
  - Hero section with gradient background
  - Feature grid with icons
  - Social proof section
  - Pricing/CTA section
  - Modern animations and spacing

### 3. Phase 5: Enablement Timeline & Sessions ✅
- **Features to Implement**:
  - Session logging (date, attendees, topics, outcomes)
  - Enablement timeline view
  - Follow-up nudges (placeholder for email/Slack)
  - Reporting dashboards (coverage, requests, workload)

### 4. Google Account Integration in Settings ✅
- **New Features**:
  - Display Google account info (email, name, avatar)
  - Link/unlink Google account
  - Sync profile from Google
  - Account connection status

---

## Implementation Steps

### Step 1: Fix OAuth Redirect
- [x] Create OAuth callback route handler
- [x] Process Supabase session token
- [x] Set user session in AuthState
- [x] Redirect to `/dashboard` after successful auth

### Step 2: Redesign Landing Page
- [x] Create modern hero section
- [x] Add feature showcase grid
- [x] Add social proof/testimonials section
- [x] Add CTA sections
- [x] Improve typography and spacing
- [x] Add subtle animations

### Step 3: Phase 5 Features
- [x] Create SessionLog model
- [x] Create session logging UI
- [x] Create enablement timeline view
- [x] Add reporting dashboard
- [x] Add follow-up nudge placeholder

### Step 4: Google Account Settings
- [x] Add Google account info display
- [x] Add account connection status
- [x] Add sync profile from Google
- [x] Add link/unlink functionality

---

## Database Schema Updates

### New Tables
```sql
session_logs:
  - id
  - circle_id (nullable)
  - pod_id
  - facilitator_id
  - date
  - summary
  - topics (JSON)
  - attendees (JSON)
  - action_items (JSON)
  - created_at
```

### User Model Updates
```sql
users:
  - google_id (new)
  - google_email (new)
  - avatar_url (new)
  - oauth_provider (new) - 'google' | 'email'
```

---

## File Structure

```
app/
├── models.py (add SessionLog, update User)
├── pages/
│   ├── landing_page.py (redesign)
│   ├── sessions_page.py (new)
│   └── settings_page.py (add Google account tab)
├── components/
│   ├── session_ui.py (new)
│   └── timeline_ui.py (new)
└── states/
    ├── session_state.py (new)
    └── auth_state.py (update OAuth handler)
```

---

## Timeline

1. **OAuth Fix** - 15 min
2. **Landing Page** - 30 min
3. **Phase 5 Features** - 45 min
4. **Google Settings** - 20 min

**Total**: ~2 hours

