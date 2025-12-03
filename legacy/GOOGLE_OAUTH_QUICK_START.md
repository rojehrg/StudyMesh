# Google OAuth Setup - Quick Start Guide

Follow these steps to enable Google OAuth in Supabase for Meshflow.

---

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create or Select a Project
- If you don't have a project, click **"Select a project"** → **"New Project"**
- Name it: `Meshflow OAuth` (or any name you prefer)
- Click **"Create"**

### 1.3 Enable Google+ API
1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for: `Google+ API`
3. Click on it and press **"Enable"**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"** (left sidebar)
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, configure the OAuth consent screen first:
   - **User Type**: External (unless you have a Google Workspace)
   - **App name**: `Meshflow`
   - **User support email**: Your email
   - **Developer contact**: Your email
   - Click **"Save and Continue"** through the steps
   - **Scopes**: Just click "Save and Continue" (default is fine)
   - **Test users**: Add your email if needed, then "Save and Continue"

5. **Create OAuth Client ID**:
   - **Application type**: Select **"Web application"**
   - **Name**: `Meshflow OAuth`
   
   - **Authorized JavaScript origins**: Click **"+ ADD URI"** and add:
     ```
     https://yrpiyqiocdfbwwtlktgu.supabase.co
     http://localhost:3000
     ```
   
   - **Authorized redirect URIs**: Click **"+ ADD URI"** and add:
     ```
     https://yrpiyqiocdfbwwtlktgu.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
   
   - Click **"CREATE"**

6. **Save Your Credentials**:
   - A popup will show your **Client ID** and **Client Secret**
   - ⚠️ **Copy both immediately** - you won't see the secret again!
   - Client ID looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - Client Secret looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

---

## Step 2: Configure Supabase

### 2.1 Go to Supabase Dashboard
- Visit: https://supabase.com/dashboard
- Select your project: `yrpiyqiocdfbwwtlktgu`

### 2.2 Enable Google Provider
1. In the left sidebar, click **"Authentication"**
2. Click **"Providers"** (or go to: Authentication → Providers)
3. Find **"Google"** in the list of providers
4. Toggle the switch to **ON** (it will turn blue/green)

### 2.3 Enter OAuth Credentials
1. **Client ID (for OAuth)**: Paste your Google Client ID
   - The one that looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

2. **Client Secret (for OAuth)**: Paste your Google Client Secret
   - The one that looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`

3. Click **"Save"** at the bottom

### 2.4 Verify Configuration
- You should see a green checkmark or "Enabled" status
- The Google provider should show as **"Enabled"**

---

## Step 3: Test It!

### 3.1 Start Your App
```bash
cd /Users/rojehhosny/Desktop/studymesh
source venv/bin/activate
reflex run
```

### 3.2 Test OAuth Flow
1. Go to: http://localhost:3000/login
2. Click **"Sign in with Google"** button
3. You should be redirected to Google sign-in
4. Sign in with your Google account
5. You'll be redirected back to your app

---

## Troubleshooting

### "Redirect URI mismatch" Error
- **Problem**: The redirect URI in Google Cloud Console doesn't match Supabase
- **Fix**: 
  1. Go back to Google Cloud Console → Credentials
  2. Edit your OAuth client
  3. Make sure **Authorized redirect URIs** includes:
     ```
     https://yrpiyqiocdfbwwtlktgu.supabase.co/auth/v1/callback
     ```
  4. Save and wait 1-2 minutes for changes to propagate

### "Invalid client" Error
- **Problem**: Client ID or Secret is wrong
- **Fix**:
  1. Double-check you copied the correct values
  2. Make sure there are no extra spaces
  3. Verify in Supabase Dashboard → Authentication → Providers → Google

### OAuth Button Doesn't Work
- **Problem**: Environment variables not loaded
- **Fix**:
  1. Make sure `.env` has `SUPABASE_URL` and `SUPABASE_ANON_KEY`
  2. Restart your Reflex server
  3. Check terminal for any error messages

### "Access blocked" Error
- **Problem**: OAuth consent screen not configured
- **Fix**:
  1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
  2. Complete all required fields
  3. Add your email as a test user if in testing mode

---

## Quick Reference

**Your Supabase Project URL:**
```
https://yrpiyqiocdfbwwtlktgu.supabase.co
```

**Required Redirect URI:**
```
https://yrpiyqiocdfbwwtlktgu.supabase.co/auth/v1/callback
```

**Local Development Redirect URI:**
```
http://localhost:3000/auth/callback
```

---

## What Happens After Setup

1. ✅ Users can click "Sign in with Google"
2. ✅ They're redirected to Google sign-in
3. ✅ After authentication, Supabase creates/updates their user account
4. ✅ User is redirected back to your app, logged in
5. ✅ You can access user info via Supabase Auth API

---

## Security Notes

- ✅ **Client ID**: Safe to expose (it's public)
- ⚠️ **Client Secret**: Keep it secret! Only use in Supabase Dashboard
- 🔒 Never commit `.env` file to Git (already in `.gitignore`)
- 🔒 Never expose Client Secret in client-side code

---

## Need Help?

If you run into issues:
1. Check the error message in the browser console
2. Check Supabase Dashboard → Authentication → Logs
3. Verify all URIs match exactly (no trailing slashes)
4. Wait 1-2 minutes after making changes (Google can be slow to update)

