# Cache Strategy for Instant Sanity Updates - Explained

This document explains how Vercel ISR works with Nuxt and why certain approaches work or don't work.

## Understanding the Caching Layers

When you deploy a Nuxt app to Vercel with Sanity CMS, there are **three caching layers**:

```
User Request
    ↓
1. ⚡ Vercel CDN Cache (Edge Network)
    ↓
2. 🔧 Nitro Server Cache (Application Level)
    ↓
3. 💾 Sanity CDN Cache (if useCdn: true)
    ↓
Sanity API (Fresh Data)
```

## Why `event.context.nitro.hooks.callHook('revalidate', ...)` Doesn't Work

This was my initial approach, but it has limitations:

```typescript
// ❌ This approach has issues
await event.context.nitro.hooks.callHook('revalidate', `/voyages/${slug}`)
```

**Problems:**

1. **Not a built-in Nitro hook**: The `'revalidate'` hook doesn't exist by default in Nitro - you'd have to define it yourself
2. **Only clears Nitro cache**: Even if you define it, it only clears layer #2 (Nitro's cache)
3. **Doesn't touch Vercel's CDN**: Layer #1 (Vercel's edge cache) remains unchanged
4. **Vercel-specific ISR**: On Vercel, ISR is managed by Vercel's infrastructure, not Nitro

## The Correct Solution for Vercel + Nuxt

Based on [Vercel's official ISR documentation](https://vercel.com/docs/incremental-static-regeneration/quickstart?framework=nuxt), here are the correct approaches:

### ✅ Solution 1: Time-Based ISR (Simplest)

**How it works:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/voyages/**': { isr: 60 }, // Cache for 60 seconds
  },
  sanity: {
    useCdn: false, // Always fetch fresh data from Sanity
  },
})
```

**Caching flow:**
1. Vercel CDN caches the page for 60 seconds (layer #1)
2. When cache expires, next visitor triggers regeneration
3. Nuxt queries Sanity API directly (layer #3 bypassed with `useCdn: false`)
4. Fresh page is generated and cached again

**Pros:**
- ✅ Simple, no webhooks needed
- ✅ Always works reliably
- ✅ No additional API tokens required

**Cons:**
- ⚠️ Up to 60-second delay for updates

### ✅ Solution 2: Webhook + Bypass Token (Instant) - RECOMMENDED

**How it works:**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },
})

// server/api/revalidate.post.ts
await $fetch(`${baseUrl}/voyages/${slug}`, {
  method: 'HEAD',
  headers: {
    'x-prerender-revalidate': process.env.VERCEL_BYPASS_TOKEN,
  },
})
```

**Caching flow:**
1. Sanity sends webhook on publish
2. Your webhook makes HEAD request with `x-prerender-revalidate` header
3. Vercel's ISR immediately regenerates the page
4. Fresh content is served from cache

**Pros:**
- ✅ Instant updates (< 1 second)
- ✅ Official Vercel + Nuxt approach
- ✅ Simple setup (just one environment variable)
- ✅ No external API calls needed

**Cons:**
- ⚠️ Requires webhook endpoint configuration

### ✅ Solution 3: Hybrid Approach (What We Implemented)

Combine both for best results:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/voyages/**': { isr: 60 }, // Fallback: regenerate every 60s
  },
  sanity: {
    useCdn: false, // Always query fresh data
  },
  nitro: {
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },
})

// server/api/revalidate.post.ts
// Try to revalidate with bypass token, fall back to ISR if not configured
if (bypassToken) {
  await $fetch(url, {
    method: 'HEAD',
    headers: { 'x-prerender-revalidate': bypassToken },
  })
  // Revalidated instantly!
} else {
  // No problem, ISR will handle it within 60s
}
```

**Benefits:**
- ✅ Instant updates when bypass token is configured
- ✅ Falls back to 60s ISR if token not set
- ✅ Best reliability
- ✅ Official Vercel + Nuxt approach

## What We Implemented

### Current Setup (Hybrid with Bypass Token - RECOMMENDED)

```typescript
// ✅ What's configured now:
routeRules: {
  '/voyages/**': { isr: 60 },  // 60-second cache (fallback)
}

sanity: {
  useCdn: false,  // Fresh queries always
}

nitro: {
  vercel: {
    config: {
      bypassToken: process.env.VERCEL_BYPASS_TOKEN,  // Instant revalidation
    },
  },
}

// Webhook triggers instant revalidation with bypass token
// Falls back to 60s ISR if token not configured
```

**With `VERCEL_BYPASS_TOKEN` configured:**
- ✅ Updates appear instantly (< 1 second)

**Without `VERCEL_BYPASS_TOKEN`:**
- ✅ Updates appear within ~60 seconds (still works!)

## Comparison with Other Frameworks

### Next.js
```typescript
// Next.js has built-in function
import { revalidatePath } from 'next/cache'
revalidatePath('/voyages/bali') // Works directly
```

### Nuxt
```typescript
// Nuxt requires either:
// 1. Time-based ISR (configured in routeRules)
// 2. Vercel Purge API (manual API call)
// No built-in revalidatePath equivalent
```

## Why Sanity CDN is Disabled

```typescript
sanity: {
  useCdn: false, // ← This is crucial!
}
```

**With CDN enabled (`useCdn: true`):**
- Queries go through Sanity's CDN
- CDN caches data for ~60 seconds
- Even if you clear Vercel's cache, you get stale Sanity data
- Total delay: Vercel cache + Sanity cache = up to 120 seconds

**With CDN disabled (`useCdn: false`):**
- Queries hit Sanity API directly
- Always get latest data
- Only delay is Vercel's cache (60 seconds, or instant with Purge API)

## Monitoring & Debugging

### Check if cache is working:

```bash
# Check response headers
curl -I https://yourdomain.com/voyages/bali

# Look for:
X-Vercel-Cache: HIT    # Served from cache
X-Vercel-Cache: MISS   # Generated fresh
Age: 30                # Been cached for 30 seconds
```

### Check Vercel logs:

1. Go to Vercel Dashboard → Your Project → Logs
2. Look for webhook calls: `"Sanity webhook received"`
3. Check purge API responses: `"Cache purged instantly"`

### Test the webhook:

```bash
# Manually trigger webhook
curl -X POST https://yourdomain.com/api/revalidate \
  -H "x-sanity-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "_type": "voyage",
    "slug": { "current": "bali" }
  }'
```

## Summary

**Question**: "How do I get instant cache updates from Sanity on Vercel?"

**Answer**: 
1. **Simple (60s)**: Configure `isr: 60` in routeRules + `useCdn: false` ✅ 
2. **Instant (<1s)**: Configure `bypassToken` and send HEAD request with `x-prerender-revalidate` header ✅✅
3. **Best**: Use both as fallback strategy (what we implemented!) ✅✅✅

**Why `event.context.nitro.hooks.callHook('revalidate', ...)` doesn't work**: 

The `revalidate` hook is not a built-in Nitro hook - it would need to be defined manually. Even if defined, it only clears Nitro's server cache (layer 2), not Vercel's CDN cache (layer 1). 

**The correct approach**: Vercel manages ISR at the **CDN level**, not at Nitro's application level. You need to use Vercel's infrastructure:
- **Time-based ISR**: Automatic background revalidation every N seconds
- **On-demand ISR**: Send request with `x-prerender-revalidate: bypassToken` header

## References

- [Vercel ISR Documentation](https://vercel.com/docs/incremental-static-regeneration/quickstart?framework=nuxt) - **THE SOURCE OF TRUTH**
- [Vercel On-Demand Revalidation for Nuxt](https://vercel.com/docs/incremental-static-regeneration/quickstart?framework=nuxt#on-demand-revalidation)
- [Nuxt Hybrid Rendering](https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering)
- [Sanity Webhooks](https://www.sanity.io/docs/webhooks)

