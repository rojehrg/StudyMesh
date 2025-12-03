# How to Get Your Supabase Keys

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project (the one with ref: `yrpiyqiocdfbwwtlktgu`)

2. **Get Your API Keys**
   - Navigate to: **Settings** (gear icon in left sidebar)
   - Click: **API** in the settings menu
   - You'll see two sections:
     - **Project API keys**
     - **Project URL**

3. **Copy the Values**
   - **Project URL**: Already added to your `.env` as `SUPABASE_URL`
     - Should be: `https://yrpiyqiocdfbwwtlktgu.supabase.co`
   - **anon public key**: Copy this value
     - Look for the key labeled `anon` `public`
     - It will look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key** (optional, for admin operations): Copy this if needed
     - Look for the key labeled `service_role` `secret`
     - ⚠️ **Keep this secret!** Never expose it in client-side code

4. **Update Your .env File**
   - Open `.env` in your project root
   - Replace `your-anon-key-here` with the actual anon key you copied
   - Example:
     ```
     SUPABASE_URL=https://yrpiyqiocdfbwwtlktgu.supabase.co
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaXBoeWlxb2NkZmJ3d3Rsa3RndSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzMxMjM0NTY3LCJleHAiOjIwNDY4MTA1Njd9.abc123...
     ```

5. **Verify It Works**
   - Restart your Reflex server
   - Try clicking "Sign in with Google" button
   - The error should be gone (though OAuth will still need to be configured in Supabase Dashboard)

## Visual Guide

```
Supabase Dashboard
├── Settings (⚙️)
    └── API
        ├── Project URL: https://yrpiyqiocdfbwwtlktgu.supabase.co
        └── Project API keys
            ├── anon public: [Copy this key]
            └── service_role secret: [Optional, keep secret]
```

## Security Notes

- ✅ **anon key**: Safe to use in client-side code (it's public)
- ⚠️ **service_role key**: NEVER expose in client-side code, only use server-side
- 🔒 Keep your `.env` file secure and never commit it to Git (already in `.gitignore`)

## Next Steps

After adding the keys:
1. The OAuth error will disappear
2. You'll still need to configure Google OAuth in Supabase Dashboard (see `SUPABASE_OAUTH_SETUP.md`)
3. Once OAuth is configured, the "Sign in with Google" button will work

