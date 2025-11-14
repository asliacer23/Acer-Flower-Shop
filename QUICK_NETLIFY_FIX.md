# Why Netlify Deployment Might Not Work - Quick Fix

## The Problem

Your `.env` file is **NOT** sent to Netlify. This means Supabase URLs/keys are missing online.

## The Solution (3 Steps)

### Step 1: Go to Netlify Dashboard
```
https://app.netlify.com → Your Site → Site Settings
```

### Step 2: Add Environment Variables
```
Build & Deploy → Environment
```

Add these two variables:
```
VITE_SUPABASE_URL = https://pxenuyqdsbznuuguomxd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4ZW51eXFkc2J6bnV1Z3VvbXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTQ1NjUsImV4cCI6MjA3ODU5MDU2NX0.paPJb2AtqLOzc0YfRYlSsFrgOVksoStuZsI0Sd-KAbU
```

### Step 3: Trigger Redeploy
```
Deployments → Trigger Deploy
```

## What to Check After Deploy

1. **Open DevTools (F12)**
2. **Go to Console tab**
3. **Look for errors like:**
   - ❌ "Missing Supabase environment variables" = Need to add env vars
   - ❌ "CORS error" = Add Netlify URL to Supabase CORS
   - ✅ No errors = All good!

## CORS Fix (If Needed)

If you see CORS errors:

1. Go to: https://app.supabase.com → Your Project → Settings → API → CORS
2. Add your Netlify URL: `https://your-site-name.netlify.app`
3. Save

## Test It

After deploying:
- Sign up with real Gmail
- Log in
- Add item to cart
- Checkout
- Check Supabase Dashboard → orders table to verify order saved

**Done!** Your app should work online now.
