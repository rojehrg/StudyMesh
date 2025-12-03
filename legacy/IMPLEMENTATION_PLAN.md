# Implementation Plan: UI Fixes, OAuth, and Landing Page

## Research Summary

### 1. Supabase Schema Viewing
**Best Practice**: Use Supabase Dashboard → Table Editor to view schema visually, or connect via psql/query tool.
- **Dashboard**: https://supabase.com/dashboard → Your Project → Table Editor
- **SQL Editor**: Run `\d table_name` or `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profile';`
- **Migration Files**: Check `alembic/versions/` for schema history

### 2. Supabase OAuth (Google/Gmail)
**Best Practice**: Supabase Auth supports OAuth providers including Google.
- Enable Google provider in Supabase Dashboard → Authentication → Providers
- Configure OAuth credentials (Client ID, Secret) from Google Cloud Console
- Use Supabase JS client or REST API for OAuth flow
- **For Reflex**: Since Reflex is Python backend, we'll need to:
  - Use Supabase REST API or Python client (`supabase-py`)
  - Handle OAuth callback via redirect URL
  - Store tokens securely

### 3. Input Text Color
**Issue**: Input text may appear gray due to browser defaults or CSS inheritance.
**Solution**: Explicitly set `color: #111827` (gray-900) on all input/textarea elements.

### 4. Landing Page Best Practices
- Hero section with clear value proposition
- Feature highlights with icons
- How it works section
- Social proof/testimonials (optional)
- Clear CTA buttons
- Responsive design
- Fast loading (optimize images/assets)

---

## Implementation Tasks

### Task 1: Fix Input Text Color ✅
- Add explicit `color: #111827` to all input/textarea elements in global CSS
- Ensure text is black when typing, not gray

### Task 2: Update Demo Email ✅
- Change `demo@university.edu` → `demo@rippling.com` in `auth_state.py`
- Update placeholder text in auth forms if needed

### Task 3: Supabase Schema Documentation ✅
- Create guide for viewing schema in Supabase Dashboard
- Document connection verification steps

### Task 4: Gmail OAuth Integration
- Install `supabase-py` package
- Configure Google OAuth in Supabase Dashboard
- Create OAuth callback handler
- Add "Sign in with Google" button to auth pages
- Update auth state to handle OAuth tokens

### Task 5: Landing Page
- Create `/landing` or `/` route (if not authenticated)
- Design hero section with Meshflow branding
- Add feature sections (matching, pods, working circles)
- Add "How it works" section
- Make Meshflow logo clickable to navigate to landing
- Ensure responsive design

### Task 6: Update Technical Notes
- Document OAuth setup process
- Document schema viewing methods
- Update architecture notes

---

## Implementation Order
1. ✅ Fix input text color (quick win)
2. ✅ Update demo email (quick win)
3. ✅ Create schema viewing guide
4. Create landing page (visual impact)
5. Implement Gmail OAuth (requires Supabase config)
6. Update technical notes

