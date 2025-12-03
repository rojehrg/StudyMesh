# 🚀 Vercel Deployment Guide

## Quick Deploy (5 minutes)

### Step 1: Push to GitHub

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit - Ready for Vercel"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/studymesh.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in (GitHub account recommended)
2. **Click "Add New Project"**
3. **Import your GitHub repository** (`studymesh`)
4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (root)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

### Step 3: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://yrpiyqiocdfbwwtlktgu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlycGl5cWlvY2RmYnd3dGxrdGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MjM2MDgsImV4cCI6MjA4MDA5OTYwOH0.ufudNsQgdgAx6-O5JXumAVMFdpkJYXvHPGx3FCfSbOA
DATABASE_URL=postgresql://postgres.yrpiyqiocdfbwwtlktgu:[YOUR-PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

**Important:**
- Replace `[YOUR-PASSWORD]` with your actual Supabase password
- Make sure to add these for **Production**, **Preview**, and **Development** environments
- Click "Save" after adding each variable

### Step 4: Update Supabase Redirect URLs

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs:**
   ```
   https://your-project.vercel.app/auth/callback
   ```
3. Update **Site URL** to:
   ```
   https://your-project.vercel.app
   ```

### Step 5: Deploy!

Click **"Deploy"** in Vercel. It will:
- Install dependencies
- Build your Next.js app
- Deploy to a global CDN
- Give you a URL like `https://studymesh.vercel.app`

---

## Post-Deployment Checklist

### ✅ Database Migrations

Your database schema should already be set up from local development. If you need to run migrations:

```bash
# In Vercel Dashboard → Deployments → Click on a deployment → View Function Logs
# Or run locally with production DATABASE_URL:
npx drizzle-kit push
```

### ✅ Google OAuth Setup

1. **Google Cloud Console** → Your OAuth 2.0 Client
2. Add to **Authorized redirect URIs:**
   ```
   https://your-project.vercel.app/auth/callback
   ```
3. Add to **Authorized JavaScript origins:**
   ```
   https://your-project.vercel.app
   ```

### ✅ Test Everything

- [ ] Landing page loads
- [ ] Sign up works
- [ ] Google OAuth works
- [ ] Dashboard loads
- [ ] Pods can be created
- [ ] Nudges work
- [ ] Notifications work

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error: "Environment variable not found"**
- Double-check all 3 env vars are added in Vercel
- Make sure they're added for the correct environment (Production/Preview)

### OAuth Not Working

**"OAuth not configured"**
- Check Supabase Redirect URLs include your Vercel domain
- Check Google Console has your Vercel domain
- Make sure `NEXT_PUBLIC_SUPABASE_URL` is correct

### Database Connection Issues

**"Connection refused"**
- Verify `DATABASE_URL` uses the **Transaction Pooler** port (`6543`)
- Format: `postgresql://postgres.xxx:[PASSWORD]@aws-1-us-east-2.pooler.supabase.com:6543/postgres`
- Not the direct connection port (`5432`)

---

## Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain (e.g., `meshflow.com`)
3. Follow DNS instructions to point your domain to Vercel
4. Update Supabase/Google OAuth URLs with your custom domain

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `DATABASE_URL` | Postgres connection string (Pooler) | `postgresql://postgres.xxx:...` |

---

## Performance Tips

- ✅ Vercel automatically optimizes Next.js builds
- ✅ Images are optimized via Next.js Image component
- ✅ Static pages are pre-rendered
- ✅ API routes run as serverless functions
- ✅ Global CDN for fast loading worldwide

---

## Need Help?

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)

---

**You're all set! 🎉**

