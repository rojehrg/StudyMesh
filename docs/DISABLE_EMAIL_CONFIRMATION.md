# Disable Email Confirmation in Supabase

## Quick Fix: Disable Email Confirmation

By default, Supabase requires users to confirm their email before they can sign in. If you're not receiving confirmation emails (or want to skip this step for development/testing), you can disable it.

## Steps to Disable Email Confirmation

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Go to: **Authentication** → **Settings** (or **Configuration**)
   - Scroll down to **Email Auth** section

3. **Disable Email Confirmation**
   - Find **"Enable email confirmations"** toggle
   - **Turn it OFF**
   - Click **Save**

4. **Alternative: Auto-Confirm Users**
   - If you can't find the toggle, look for **"Confirm email"** setting
   - Set it to **"Off"** or **"Disabled"**

## What This Does

- ✅ Users can sign up and immediately sign in (no email confirmation needed)
- ✅ Signup flow will automatically log users in
- ✅ Users are redirected to `/onboarding` after signup

## For Production

If you want email confirmation in production but not in development:

1. **Use Supabase's Environment-Specific Settings**
   - Keep email confirmation ON for production
   - Turn it OFF for development/testing

2. **Or Use Magic Links Instead**
   - Users get a passwordless login link via email
   - More secure and user-friendly

## Troubleshooting

**Still not working?**
- Make sure you saved the settings in Supabase
- Clear your browser cache
- Try signing up with a new email
- Check Supabase logs: **Logs** → **Auth Logs**

---

**After disabling email confirmation, users will be automatically logged in after signup!** 🎉

