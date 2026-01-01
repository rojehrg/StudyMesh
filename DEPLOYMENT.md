# Deployment Guide

Complete guide for deploying Attunly to Vercel with all integrations.

## Quick Deploy (10 minutes)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`

### Step 3: Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL | `https://attunly.vercel.app` |
| `DATABASE_URL` | Postgres connection (use Transaction Pooler) | `postgresql://postgres.xxx:...@pooler.supabase.com:6543/postgres` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |

#### Security Variables

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `ADMIN_SECRET` | Admin API authentication | `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Token encryption key (32 bytes hex) | `openssl rand -hex 32` |

#### Slack Integration (Optional)

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `SLACK_CLIENT_ID` | Slack App Client ID | [api.slack.com/apps](https://api.slack.com/apps) |
| `SLACK_CLIENT_SECRET` | Slack App Client Secret | Slack App Settings |
| `SLACK_WEBHOOK_URL` | Incoming Webhook URL | Slack App → Incoming Webhooks |

### Step 4: Configure OAuth Providers

#### Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Add to **Authorized JavaScript origins**:
   ```
   https://your-app.vercel.app
   ```

#### Slack App Setup (Optional)

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create a new app or select existing
3. Configure OAuth & Permissions:
   - **Bot Token Scopes**: `chat:write`, `users:read`, `im:write`, `team:read`
   - **User Token Scopes**: `openid`, `profile`, `email`
4. Add **Redirect URLs**:
   ```
   https://your-app.vercel.app/api/auth/slack/callback
   https://your-app.vercel.app/api/slack/oauth/callback
   ```
5. (Optional) Enable **Incoming Webhooks** for fallback notifications

### Step 5: Deploy

Click **Deploy** in Vercel. Your app will be live in ~2 minutes.

---

## Post-Deployment Checklist

### Database Migrations

Run migrations after first deploy:

```bash
curl -X POST https://your-app.vercel.app/api/admin/migrate \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

### Verify Everything Works

- [ ] Landing page loads
- [ ] Email signup works
- [ ] Google OAuth works
- [ ] Slack OAuth works (if configured)
- [ ] Dashboard loads after login
- [ ] Pods can be created
- [ ] Nudges send notifications
- [ ] Meetings can be scheduled

---

## Environment Variables Reference

### All Variables

```bash
# ===================
# PUBLIC (Client-safe)
# ===================
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# ===================
# DATABASE
# ===================
DATABASE_URL=postgresql://postgres.xxx:[PASSWORD]@pooler.supabase.com:6543/postgres

# ===================
# SUPABASE ADMIN
# ===================
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# ===================
# SECURITY
# ===================
ADMIN_SECRET=your-64-char-hex-string
ENCRYPTION_KEY=your-64-char-hex-string

# ===================
# SLACK (Optional)
# ===================
SLACK_CLIENT_ID=123456789.987654321
SLACK_CLIENT_SECRET=abcdef123456...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
```

### Generate Security Keys

```bash
# Generate both keys at once
echo "ADMIN_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
```

---

## Authentication Flow

### Supported Methods

| Method | Provider | Required Config |
|--------|----------|-----------------|
| Email + Password | Supabase Auth | Supabase project |
| Google OAuth | Supabase + Google | Google Cloud Console |
| Slack OAuth | Custom + Supabase | Slack App |

### How Each Works

**Email + Password**
1. User signs up with email
2. Supabase sends verification email
3. User clicks link → redirected to app
4. Session created via Supabase Auth

**Google OAuth**
1. User clicks "Continue with Google"
2. Redirected to Google consent
3. Google redirects to Supabase callback
4. Supabase creates session, redirects to `/auth/callback`
5. App creates/updates profile

**Slack OAuth**
1. User clicks "Sign in with Slack"
2. Redirected to Slack consent
3. Slack redirects to `/api/auth/slack/callback`
4. App creates organization, user, profile
5. Magic link created for session

---

## Slack Integration Details

### What Slack Provides

| Feature | Description |
|---------|-------------|
| **Sign-in** | Alternative login method via Slack workspace |
| **DM Notifications** | Nudges and meeting invites sent as Slack DMs |
| **Webhook Fallback** | Channel mentions when DM unavailable |
| **Workspace Context** | Organization = Slack Workspace |

### Slack Scopes Explained

| Scope | Purpose |
|-------|---------|
| `chat:write` | Send messages as the bot |
| `users:read` | Read user info (name, email, timezone) |
| `im:write` | Open DM channels with users |
| `team:read` | Read workspace info |
| `openid` | OpenID Connect authentication |
| `profile` | User profile data |
| `email` | User email address |

### Token Security

- Slack access tokens are **encrypted at rest** using AES-256-GCM
- Requires `ENCRYPTION_KEY` environment variable
- Tokens decrypted only when sending notifications
- Legacy unencrypted tokens are auto-handled

---

## Troubleshooting

### Build Errors

**"Module not found"**
- Run `npm install` locally to verify dependencies
- Check all imports use correct paths

**"Environment variable not found"**
- Verify all required env vars are set in Vercel
- Check they're enabled for Production environment

### OAuth Issues

**"OAuth not configured"**
- Check Supabase URL Configuration has your domain
- Verify redirect URLs match exactly

**Google OAuth fails**
- Ensure redirect URI in Google Console matches Supabase callback URL
- Check JavaScript origins include your domain

**Slack OAuth fails**
- Verify `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET` are correct
- Check redirect URLs in Slack App settings
- Ensure bot has required scopes

### Database Issues

**"Connection refused"**
- Use Transaction Pooler URL (port `6543`), not direct connection
- Format: `postgresql://postgres.xxx:[PASSWORD]@pooler.supabase.com:6543/postgres`

**"Relation does not exist"**
- Run migrations: `POST /api/admin/migrate` with Bearer token

### Notification Issues

**Slack notifications not sending**
- Check `SLACK_WEBHOOK_URL` is configured (for webhook method)
- Verify user has connected Slack in Settings (for DM method)
- Check user's `slack_connected` is `true` in database

---

## Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `app.attunly.com`)
3. Configure DNS as instructed
4. Update all OAuth redirect URLs with new domain:
   - Supabase URL Configuration
   - Google Cloud Console
   - Slack App Settings
5. Update `NEXT_PUBLIC_APP_URL` in Vercel

---

## Performance

Vercel automatically provides:
- Global CDN distribution
- Automatic HTTPS
- Edge caching for static assets
- Serverless function optimization
- Image optimization via Next.js

---

## Security Headers

The app automatically sets these headers via `next.config.ts`:

| Header | Value |
|--------|-------|
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Slack API Docs**: [api.slack.com](https://api.slack.com)
