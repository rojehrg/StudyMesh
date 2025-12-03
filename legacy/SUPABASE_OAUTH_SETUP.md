# Supabase Gmail OAuth Setup Guide

## Overview

This guide explains how to set up Google (Gmail) OAuth authentication with Supabase for Meshflow.

## Prerequisites

1. Supabase project created
2. Google Cloud Console account
3. Supabase project URL and anon key

## Step 1: Configure Google OAuth in Google Cloud Console

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to: **APIs & Services** → **Library**
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to: **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: "Meshflow OAuth"
   - **Authorized JavaScript origins**: 
     - `https://[your-project-ref].supabase.co`
     - `http://localhost:3000` (for local development)
   - **Authorized redirect URIs**:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Click **Create**
   - **Save the Client ID and Client Secret** (you'll need these)

## Step 2: Configure Supabase OAuth Provider

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Enable Google Provider**
   - Navigate to: **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON**

3. **Enter OAuth Credentials**
   - **Client ID (for OAuth)**: Paste your Google Client ID
   - **Client Secret (for OAuth)**: Paste your Google Client Secret
   - Click **Save**

4. **Configure Redirect URL**
   - In the same page, note the **Redirect URL**:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Make sure this matches what you added in Google Cloud Console

## Step 3: Environment Variables

Add to your `.env` file:

```bash
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]  # Optional, for admin operations
```

To find these:
- **Supabase URL**: Dashboard → Settings → API → Project URL
- **Anon Key**: Dashboard → Settings → API → Project API keys → `anon` `public`
- **Service Role Key**: Dashboard → Settings → API → Project API keys → `service_role` `secret`

## Step 4: Install Supabase Python Client

```bash
source venv/bin/activate
pip install supabase
```

## Step 5: Test OAuth Flow

1. Start your Reflex app: `reflex run`
2. Navigate to login page
3. Click "Sign in with Google"
4. You should be redirected to Google sign-in
5. After authentication, you'll be redirected back to your app

## Troubleshooting

**"Redirect URI mismatch" error:**
- Verify the redirect URI in Google Cloud Console matches exactly:
  - `https://[your-project-ref].supabase.co/auth/v1/callback`
- Check for trailing slashes or typos

**"Invalid client" error:**
- Verify Client ID and Secret are correct in Supabase dashboard
- Make sure Google+ API is enabled in Google Cloud Console

**OAuth button not appearing:**
- Check that Google provider is enabled in Supabase dashboard
- Verify environment variables are set correctly
- Check browser console for errors

**Callback not working:**
- Ensure your app is running on the correct port
- Check that the callback route is properly configured
- Verify Supabase redirect URL matches your app's callback URL

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use environment variables** - Never hardcode keys
3. **Rotate keys periodically** - Update OAuth credentials if compromised
4. **Use HTTPS in production** - OAuth requires secure connections
5. **Restrict redirect URIs** - Only allow your domain in Google Cloud Console

## Next Steps

After OAuth is configured:
1. Test the full authentication flow
2. Update user profile creation to use OAuth user data
3. Handle OAuth errors gracefully
4. Add logout functionality that clears OAuth session

