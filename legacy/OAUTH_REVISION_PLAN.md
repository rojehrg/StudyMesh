# OAuth Flow Complete Revision Plan

## Current Problems Identified

1. **Callback Page Stuck**: The `/auth/callback` page receives the token but doesn't redirect
2. **Multiple Redundant Functions**: Three different OAuth processing functions causing confusion
3. **Form Submission Unreliable**: JavaScript form submission may not work with Reflex
4. **No Direct Token Processing**: Relying on form submission instead of direct API call

## Database Schema Review

✅ **User Model is Correct:**
- `google_id`, `google_email`, `avatar_url`, `oauth_provider` fields exist
- Schema supports OAuth users properly

## New Simplified Flow

### Step 1: User Clicks "Sign in with Google"
- ✅ Current: `sign_in_with_google()` redirects to Supabase OAuth URL
- **Status**: Working correctly

### Step 2: Supabase Redirects to Callback
- **Current Issue**: Token in URL hash `#access_token=...` but page doesn't redirect
- **New Solution**: Use a simple HTML page with inline script that executes immediately

### Step 3: Process Token Directly
- **Current Issue**: Trying to use form submission which is unreliable
- **New Solution**: Process token directly in the callback page using an `on_load` handler that calls backend

### Step 4: Create/Update User & Redirect
- ✅ Current: Backend logic to create/update user exists
- **Status**: Working correctly, just needs to be called properly

## Implementation Plan

### Phase 1: Simplify Callback Page
1. Remove all JavaScript complexity
2. Use a simple `on_load` handler that processes token directly
3. Extract token from URL hash in Python (via query params after redirect)

### Phase 2: Direct Token Processing
1. Remove form submission approach
2. Process token directly in `on_load` handler
3. Use a single, clean `process_oauth_token` function

### Phase 3: Clean Up Redundant Code
1. Remove `process_oauth_token_from_url`
2. Remove `process_oauth_token_with_token`
3. Keep only `process_oauth_token` with direct token parameter

### Phase 4: Test & Verify
1. Test complete flow end-to-end
2. Verify user creation/update
3. Verify session state is set correctly
4. Verify redirect to dashboard/profile-setup

## Technical Approach

### Option A: Server-Side Token Processing (Recommended)
- Callback page uses `on_load` to call backend function
- Backend function receives token from URL query params
- Process token, create/update user, set session, redirect

### Option B: Client-Side Token Extraction + API Call
- JavaScript extracts token from hash
- Makes API call to backend endpoint
- Backend processes and redirects

**We'll use Option A** - simpler and more reliable with Reflex.

## Files to Modify

1. `app/app.py` - Simplify callback and process pages
2. `app/states/auth_state.py` - Clean up OAuth functions, keep only one
3. Remove redundant code

## Success Criteria

✅ User clicks "Sign in with Google"
✅ Redirects to Google OAuth
✅ Selects Gmail account
✅ Redirects back to app
✅ User is automatically signed in
✅ Redirects to dashboard or profile-setup
✅ No stuck pages, no manual intervention needed

