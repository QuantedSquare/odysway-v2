# Sanity Webhooks Setup Guide

This guide explains how to set up webhooks for instant content updates when publishing changes in Sanity CMS.

## How It Works

When you publish a change in Sanity Studio:
1. Sanity sends a webhook notification to your Nuxt app
2. The webhook makes a HEAD request to the page with `x-prerender-revalidate` header
3. Vercel's ISR immediately regenerates the page
4. With `useCdn: false` for Sanity, queries fetch fresh data
5. Users see the updated content instantly (< 1 second)

**Configuration modes:**
- **Without bypass token**: Relies on 60s time-based ISR (simple, automatic)
- **With bypass token**: Instant on-demand revalidation (< 1s, recommended)

## Setup Steps

### 1. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add two variables:

   **Variable 1: Webhook Secret**
   - **Name**: `SANITY_WEBHOOK_SECRET`
   - **Value**: Generate a strong random secret: `openssl rand -base64 32`
   - **Environments**: Select all (Production, Preview, Development)
   
   **Variable 2: Bypass Token (for instant updates)**
   - **Name**: `VERCEL_BYPASS_TOKEN`
   - **Value**: Generate another secret: `openssl rand -base64 32`
   - **Environments**: Select all (Production, Preview, Development)

4. Click **Save** for each

> **Important**: Copy these secrets - you'll need them for the next steps!

### 2. Configure Webhook in Sanity Studio

1. Go to [Sanity Manage](https://www.sanity.io/manage)
2. Select your project
3. Navigate to **API** → **Webhooks**
4. Click **Create webhook**
5. Configure the webhook:

   **Name**: `Vercel Revalidation`
   
   **URL**: `https://your-production-domain.com/api/v1/webhooks/sanity/revalidate`
   
   **Dataset**: Choose your dataset (e.g., `production`)
   
   **Trigger on**: Select the document types you want to trigger revalidation:
   - `voyage`
   - `blog`
   - `destination`
   - `category`
   - `homePage`
   - (Add any other content types you want to auto-update)
   
   **HTTP method**: `POST`
   
   **API version**: `v2021-03-25` (or latest)
   
   **HTTP Headers**:
   - **Name**: `x-sanity-webhook-secret`
   - **Value**: Paste the secret you generated in step 1
   
   **Projection (optional)**: Leave blank to send full document, or use:
   ```groq
   {
     _type,
     _id,
     "slug": slug.current
   }
   ```

6. Click **Save**

### 3. Test the Webhook

#### Option A: Test from Sanity Studio

1. In the webhook settings, scroll down to **Test webhook**
2. Click **Trigger test**
3. Check the **Delivery log** to see if it succeeded

#### Option B: Test by publishing content

1. Make a small change to a document in Sanity Studio
2. Publish the change
3. Wait 2-3 seconds
4. Check your website - the change should be live!

### 4. Monitor Webhook Deliveries

In Sanity's webhook settings:
- View **Recent deliveries** to see webhook activity
- Check for failed deliveries and error messages
- Retry failed deliveries if needed

## Configuration Details

### ISR (Incremental Static Regeneration)

Your pages are now configured with ISR in `nuxt.config.ts`:

```javascript
routeRules: {
  '/': { isr: 3600 },           // Homepage: 1-hour cache
  '/voyages/**': { isr: 3600 },  // Voyage pages: 1-hour cache
  '/destinations/**': { isr: 3600 },
  '/thematiques/**': { isr: 3600 },
  '/blog/**': { isr: 3600 },
}
```

This means:
- Pages are cached for 1 hour (3600 seconds)
- After cache expires, next visitor triggers regeneration
- Webhooks bypass cache and regenerate immediately

### Sanity CDN

Your Sanity config now has `useCdn: false`:

```javascript
sanity: {
  useCdn: false, // Queries fetch latest data, not cached
}
```

**Pros**:
- Always gets the latest content from Sanity
- No CDN delay (usually 60 seconds)

**Cons**:
- Slightly slower queries (usually 50-100ms difference)
- Higher Sanity API usage

> **Tip**: If you prefer faster queries and can tolerate a 60-second delay, change back to `useCdn: true`

## Troubleshooting

### Webhook returns 401 Unauthorized

**Cause**: The webhook secret doesn't match.

**Fix**:
1. Verify `SANITY_WEBHOOK_SECRET` is set correctly in Vercel
2. Redeploy your app after adding the env variable
3. Check the webhook header in Sanity matches exactly

### Changes not appearing instantly

**Possible causes**:

1. **Browser cache**: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. **Webhook not firing**: Check Sanity webhook delivery log
3. **Wrong document type**: Ensure the content type is configured in `/server/api/revalidate.post.ts`
4. **Vercel deployment**: Make sure you've deployed the latest code

### Webhook endpoint not found (404)

**Cause**: API route not deployed.

**Fix**:
1. Ensure `/server/api/revalidate.post.ts` exists
2. Deploy to Vercel: `git push origin main`
3. Wait for deployment to complete

### Check Webhook Logs

View logs in Vercel:
1. Go to your Vercel project
2. Click **Logs** or **Functions**
3. Filter for `/api/revalidate`
4. Look for "Sanity webhook received" and "Revalidated: ..." messages

## Advanced: Trigger Full Rebuild

For major changes (e.g., global navigation updates), you might want to trigger a full site rebuild instead of just revalidating specific pages.

### Option 1: Vercel Deploy Hook

1. In Vercel, go to **Settings** → **Git**
2. Scroll to **Deploy Hooks**
3. Create a new deploy hook (e.g., "Sanity Content Update")
4. Copy the URL

Add to your webhook endpoint (`/server/api/revalidate.post.ts`):

```typescript
// For critical global changes, trigger full rebuild
if (documentType === 'settings' || documentType === 'navigation') {
  // Call Vercel deploy hook
  await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' })
}
```

Add `VERCEL_DEPLOY_HOOK_URL` to your environment variables.

### Option 2: Multiple Revalidations

If a change affects multiple pages (e.g., updating a destination affects all voyages for that destination):

```typescript
// Revalidate multiple related pages
const relatedSlugs = await fetchRelatedVoyages(body.destinationId)
for (const slug of relatedSlugs) {
  await event.context.nitro.hooks.callHook('revalidate', `/voyages/${slug}`)
}
```

## Performance Considerations

### CDN vs Real-time

- **With CDN** (`useCdn: true`): ~60s delay, faster queries
- **Without CDN** (`useCdn: false`): Instant updates, slightly slower queries

### ISR Cache Duration

Adjust cache times in `nuxt.config.ts` based on update frequency:

```javascript
'/': { isr: 1800 },  // 30 minutes for frequently updated content
'/voyages/**': { isr: 7200 },  // 2 hours for stable content
'/blog/**': { isr: 3600 },  // 1 hour for blog posts
```

### API Rate Limits

With `useCdn: false`, be aware of Sanity's API limits:
- Free: 10,000 requests/day
- Growth: 500,000 requests/day
- Enterprise: Unlimited

Monitor usage at [Sanity Manage → Usage](https://www.sanity.io/manage)

---

## Summary

✅ **What you've set up**:
- Webhook endpoint at `/api/v1/webhooks/sanity/revalidate`
- ISR with 60-second background revalidation
- On-demand revalidation with bypass token (instant updates)
- Fresh Sanity data on every query (`useCdn: false`)
- Secure webhook authentication

🎉 **Result**: 
- **Without bypass token**: Changes appear within ~60 seconds
- **With bypass token**: Changes appear instantly (< 1 second) ⚡

## How to Test

### Manual Test

You can manually trigger revalidation for any page:

```bash
# Test revalidation for a specific voyage page
curl -I https://your-domain.com/voyages/bali \
  -H "x-prerender-revalidate: your-bypass-token"

# Check the response headers
# X-Vercel-Cache: BYPASS means it regenerated
```

### Test via Sanity

1. Make a change to content in Sanity Studio
2. Publish the change
3. Check Vercel logs: Go to your project → Logs
4. Look for: `✓ Revalidated instantly: /voyages/...`
5. Visit your page - changes should be live immediately!

## Need Help?

- [Nuxt ISR Documentation](https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering)
- [Sanity Webhooks Documentation](https://www.sanity.io/docs/webhooks)
- [Vercel ISR Documentation](https://vercel.com/docs/concepts/incremental-static-regeneration)

