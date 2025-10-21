# Vercel Deployment Protection & Webhooks

## The Problem

When you configure a webhook in Sanity pointing to a Vercel **preview deployment** URL (e.g., `https://your-app-xyz.vercel.app`), you might get a 401 error showing "Authenticating..." instead of reaching your webhook endpoint.

This is because Vercel's **Deployment Protection** requires authentication to access preview deployments.

## The Solution

You have three options:

### ✅ Option 1: Use Production URL (Recommended)

Configure your Sanity webhook to point to your **production domain** instead of preview URLs:

```
https://odysway.com/api/v1/webhooks/sanity/revalidate
```

**Why this works:**
- Production deployments don't have deployment protection by default
- Webhooks can reach your endpoint without authentication
- More reliable for automated systems

**How to set this up:**
1. Go to [Sanity Manage](https://www.sanity.io/manage) → Your Project → API → Webhooks
2. Update the webhook URL to use your production domain
3. Save

### ✅ Option 2: Bypass Deployment Protection for API Routes

Allow API routes to bypass authentication:

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Navigate to **Deployment Protection**
3. Scroll to **Path Allowlist** section
4. Click **Add Path**
5. Enter: `/api/v1/webhooks/sanity/revalidate`
6. Save changes

**What this does:**
- Allows unauthenticated access to specific paths
- Webhooks from Sanity can reach your endpoint
- Still protects the rest of your preview deployment

### ✅ Option 3: Disable Deployment Protection (Not Recommended)

Only for testing:

1. Go to **Vercel Dashboard** → Your Project → **Settings**
2. Navigate to **Deployment Protection**
3. Set protection to **None** or **Vercel Authentication** → Off
4. Save

**⚠️ Warning:** This exposes your entire preview deployment publicly.

## Testing Locally

To test webhooks during development:

```bash
# 1. Start your dev server
npm run dev

# 2. Use ngrok or similar to expose localhost
ngrok http 3000

# 3. Use the ngrok URL in Sanity webhook configuration
https://abc123.ngrok.io/api/v1/webhooks/sanity/revalidate
```

Or use the test page at `/test` which automatically uses `localhost:3000` when running locally.

## Verifying It Works

### Test with curl:

```bash
# Production
curl -X POST https://odysway.com/api/v1/webhooks/sanity/revalidate \
  -H "Content-Type: application/json" \
  -H "x-sanity-webhook-secret: YOUR_SECRET" \
  -d '{"_type":"voyage","slug":{"current":"test"}}'

# Should return JSON response, not HTML authentication page
```

### Expected responses:

**✅ Working (200):**
```json
{
  "success": true,
  "message": "On-demand revalidation triggered..."
}
```

**❌ Blocked by Deployment Protection (401):**
```html
<h1>Authenticating</h1>
<!-- HTML authentication page -->
```

**❌ Wrong secret (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Best Practices

1. **Always use production URLs** for webhooks from external services (Sanity, Stripe, etc.)
2. **Use preview deployments** only for internal testing
3. **Test webhooks locally** first before configuring in production
4. **Monitor webhook logs** in both Sanity and Vercel to verify delivery

## Related Documentation

- [Vercel Deployment Protection Docs](https://vercel.com/docs/security/deployment-protection)
- [Bypass Deployment Protection](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection)
- [Sanity Webhooks Setup](./SANITY_WEBHOOKS_SETUP.md)

