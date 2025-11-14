# Netlify Deployment Guide

## ✅ Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## ✅ Step 2: Set Environment Variables in Netlify

**Go to:** https://app.netlify.com → Your Site → Site Settings → Build & Deploy → Environment

**Add these environment variables:**

```
VITE_SUPABASE_URL = https://pxenuyqdsbznuuguomxd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4ZW51eXFkc2J6bnV1Z3VvbXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMTQ1NjUsImV4cCI6MjA3ODU5MDU2NX0.paPJb2AtqLOzc0YfRYlSsFrgOVksoStuZsI0Sd-KAbU
```

**Important:** Make sure you add these EXACTLY as they appear in your `.env` file.

## ✅ Step 3: Configure Netlify Build Settings

**Go to:** Site Settings → Build & Deploy → Build settings

- **Build command:** `bun run build` (or `npm run build` if not using bun)
- **Publish directory:** `dist`

## ✅ Step 4: Fix CORS Issues (If Needed)

If you see CORS errors, add this to your Supabase project:

**Go to:** Supabase Dashboard → Project Settings → API → CORS

Add your Netlify URL:
```
https://your-site-name.netlify.app
```

## ✅ Step 5: Verify Deployment

After deployment:

1. **Check Console Errors:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for red errors

2. **Common Issues:**
   - ❌ "Missing Supabase environment variables" → Environment vars not set in Netlify
   - ❌ CORS error → Add URL to Supabase CORS settings
   - ❌ "Cannot read property 'from'" → Supabase not initialized

3. **Test Features:**
   - ✅ Sign up with real Gmail
   - ✅ Log in
   - ✅ Add item to cart
   - ✅ Checkout
   - ✅ Check Supabase dashboard for orders

## Troubleshooting

### Issue: Login doesn't work on Netlify

**Solution:** Check browser Console for errors. Most common cause is missing environment variables.

### Issue: Orders not saving

**Solution:** 
1. Check Supabase API is accessible from Netlify URL
2. Verify user is actually logged in (check AuthContext)
3. Check Supabase dashboard for any database errors

### Issue: Cart not persisting

**Solution:**
- Ensure user is logged in (cart requires login now)
- Check Supabase carts table for data
- Verify user email matches

### How to Debug

1. Open Netlify Deploy Logs
2. Search for "VITE_" to see if env vars loaded
3. Check browser Console for JavaScript errors
4. Use Supabase Dashboard to verify data is being saved

## Quick Checklist

- [ ] Code pushed to GitHub
- [ ] Environment variables added to Netlify
- [ ] Build command set to `bun run build`
- [ ] Publish directory set to `dist`
- [ ] Website URL added to Supabase CORS
- [ ] Site deployed successfully
- [ ] Tested signup/login with real email
- [ ] Tested adding to cart
- [ ] Tested checkout
- [ ] Verified order in Supabase dashboard
