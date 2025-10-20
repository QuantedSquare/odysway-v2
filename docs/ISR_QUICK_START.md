# ISR with Sanity - Quick Start Guide

## What You Have Now

✅ **Hybrid ISR Setup** with instant on-demand revalidation using Vercel's bypass token approach (from [official Vercel docs](https://vercel.com/docs/incremental-static-regeneration/quickstart?framework=nuxt#on-demand-revalidation))

## Quick Setup (3 Steps)

### 1. Generate Secrets

```bash
# Generate two random secrets
openssl rand -base64 32  # For SANITY_WEBHOOK_SECRET
openssl rand -base64 32  # For VERCEL_BYPASS_TOKEN
```

### 2. Add to Vercel Environment Variables

Go to: **Vercel Project → Settings → Environment Variables**

Add these two variables (all environments):
- `SANITY_WEBHOOK_SECRET` = first secret you generated
- `VERCEL_BYPASS_TOKEN` = second secret you generated

Then redeploy your app.

### 3. Configure Sanity Webhook

Go to: [Sanity Manage](https://www.sanity.io/manage) → Your Project → API → Webhooks

Create webhook:
- **URL**: `https://your-domain.com/api/revalidate`
- **Trigger**: On document publish for: `voyage`, `blog`, `destination`, `category`, `homePage`
- **HTTP Header**: 
  - Name: `x-sanity-webhook-secret`
  - Value: Your `SANITY_WEBHOOK_SECRET`
- **Projection**: 
  ```groq
  {
    _type,
    _id,
    "slug": slug.current
  }
  ```

## How It Works

```
┌─────────────────┐
│  Sanity Studio  │
│  (Publish)      │
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────────────┐
│  /api/revalidate        │
│  (Your Nuxt API)        │
└────────┬────────────────┘
         │ HEAD request with
         │ x-prerender-revalidate: token
         ▼
┌─────────────────────────┐
│  https://your.com/path  │
│  (Vercel ISR)           │
└────────┬────────────────┘
         │
         ▼
      Regenerates page
      with fresh data
         │
         ▼
    ⚡ Live in <1s
```

## Test It

### Test webhook manually:

```bash
curl -X POST https://your-domain.com/api/revalidate \
  -H "x-sanity-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "_type": "voyage",
    "slug": {"current": "bali"}
  }'
```

### Test revalidation manually:

```bash
curl -I https://your-domain.com/voyages/bali \
  -H "x-prerender-revalidate: YOUR_BYPASS_TOKEN"

# Check response headers:
# X-Vercel-Cache: BYPASS = successfully revalidated
```

## Behavior

### ✅ WITH `VERCEL_BYPASS_TOKEN` configured:
- Publish in Sanity → Live in < 1 second ⚡
- Webhook triggers instant on-demand revalidation
- Cache cleared immediately via bypass token

### ✅ WITHOUT `VERCEL_BYPASS_TOKEN`:
- Publish in Sanity → Live within ~60 seconds ⏱️
- Webhook logs changes
- Time-based ISR handles updates automatically

## What's Configured

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Time-based ISR (fallback)
  routeRules: {
    '/voyages/**': { isr: 60 },
    '/destinations/**': { isr: 60 },
    // etc.
  },
  
  // Fresh Sanity data always
  sanity: {
    useCdn: false,
  },
  
  // On-demand revalidation
  nitro: {
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },
})
```

## Monitoring

### Check Vercel logs:
1. Vercel Dashboard → Your Project → Logs
2. Look for:
   - `✓ Sanity webhook received`
   - `✓ Revalidated instantly: /voyages/...`

### Check Sanity logs:
1. Sanity Manage → Webhooks → Your webhook
2. View **Delivery log** to see webhook calls and responses

## Troubleshooting

### Changes not appearing?

**Check #1**: Is bypass token configured?
```bash
# In Vercel: Settings → Environment Variables
# Should see: VERCEL_BYPASS_TOKEN
```

**Check #2**: Did deployment finish after adding env vars?
```bash
# Redeploy if you added the variable after initial deployment
```

**Check #3**: Is webhook firing?
```bash
# Sanity Manage → Webhooks → Delivery log
# Should see 200 responses
```

**Check #4**: Hard refresh browser
```bash
# Chrome/Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Webhook returns 401?
- Check `SANITY_WEBHOOK_SECRET` matches in both Sanity and Vercel

### Revalidation failing?
- Check `VERCEL_BYPASS_TOKEN` is set correctly
- Check your domain is correct in Sanity webhook URL
- Try manual test (see "Test It" section above)

## Files Modified

- ✅ `nuxt.config.ts` - Added ISR routes and bypass token config
- ✅ `server/api/revalidate.post.ts` - Webhook endpoint
- ✅ `exemple.env` - Added required environment variables

## Documentation

For more details, see:
- `docs/SANITY_WEBHOOKS_SETUP.md` - Complete setup guide
- `docs/CACHE_STRATEGY_EXPLAINED.md` - Technical deep dive
- [Vercel ISR Docs](https://vercel.com/docs/incremental-static-regeneration/quickstart?framework=nuxt#on-demand-revalidation) - Official source

## Summary

**Without any setup**: Pages update automatically within 60 seconds (ISR)

**With VERCEL_BYPASS_TOKEN**: Pages update instantly on Sanity publish ⚡

**Best practice**: Configure the bypass token for instant updates!

