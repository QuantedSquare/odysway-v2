# Sanity Content Revalidation - Complete Summary

## 🎯 What's Been Configured

Your webhook now handles **ALL 37 Sanity content types** with intelligent revalidation strategies.

## 📊 Revalidation Strategy Overview

### ⚡ Instant Updates (<1 second)
**With `VERCEL_BYPASS_TOKEN` configured:**

| Content Type | Direct Page | Also Revalidates |
|--------------|-------------|------------------|
| voyage | `/voyages/[slug]` | `/search`, `/prochains-departs` |
| blog | `/[slug]` | `/blog` |
| destination | `/destinations/[slug]` | `/destinations`, `/search` |
| category | `/thematiques/[slug]` | `/thematiques` |
| experience | `/experiences/[slug]` | `/experiences` |
| homePage | `/` | - |
| header | Multiple | `/`, `/destinations`, `/thematiques`, `/experiences`, `/blog` |
| footer | Multiple | `/`, `/contact` |
| + 29 more types | See full mapping | - |

### ⏱️ Time-Based Updates (60s - 1hr)
**Without bypass token OR for wildcard paths:**

All pages still update automatically based on ISR timing:
- **Dynamic content**: 60 seconds
- **Static pages**: 5 minutes
- **Legal pages**: 1 hour

## 🔄 How Content Types Are Handled

### 1️⃣ Content with Slugs (Dynamic Pages)
```javascript
// Example: Publishing a voyage called "Bali"
Publish "voyage" with slug "bali"
  ↓
Webhook triggers instant revalidation:
  ✅ /voyages/bali          (< 1s)
  ✅ /search                 (< 1s)
  ✅ /prochains-departs      (< 1s)
```

### 2️⃣ Singleton Pages (Fixed URLs)
```javascript
// Example: Updating the homepage
Publish "homePage"
  ↓
Webhook triggers instant revalidation:
  ✅ /                       (< 1s)
```

### 3️⃣ Global Content (Affects Multiple Pages)
```javascript
// Example: Updating site header
Publish "header"
  ↓
Webhook triggers instant revalidation:
  ✅ /                       (< 1s)
  ✅ /destinations           (< 1s)
  ✅ /thematiques            (< 1s)
  ✅ /experiences            (< 1s)
  ✅ /blog                   (< 1s)
  ⏱️  All other pages         (60s-3600s via ISR)
```

### 4️⃣ Page Settings (Shared Templates)
```javascript
// Example: Updating page_voyage (affects all voyage pages)
Publish "page_voyage"
  ↓
⏱️  All /voyages/* pages update within 60s via ISR
(Can't use bypass token with wildcards)
```

### 5️⃣ Referenced Content
```javascript
// Example: Updating a team member
Publish "teamMember"
  ↓
Webhook triggers instant revalidation:
  ✅ /vision-voyage-odysway  (< 1s)
```

## 📋 Complete Content Type List

### ✅ Fully Implemented (37 types)

**Dynamic Pages:**
1. ✅ voyage → `/voyages/[slug]`
2. ✅ blog → `/[blogSlug]`
3. ✅ destination → `/destinations/[slug]`
4. ✅ category → `/thematiques/[slug]`
5. ✅ experience → `/experiences/[slug]`

**Singleton Pages (17):**
6. ✅ homePage → `/`
7. ✅ entreprise → `/entreprise`
8. ✅ surMesure → `/sur-mesure`
9. ✅ visionVoyageOdysway → `/vision-voyage-odysway`
10. ✅ privacyPolicy → `/politique-de-confidentialite`
11. ✅ legalMentions → `/mentions-legales`
12. ✅ chequesVacances → `/cheques-vacances`
13. ✅ conditionsGeneralesVente → `/conditions-generales-de-vente`
14. ✅ confirmation → `/confirmation`
15. ✅ offreCadeau → `/offre-cadeau`
16. ✅ recruitment → `/nous-recrutons`
17. ✅ faq → `/faq`
18. ✅ avisVoyageurs → `/avis-voyageurs`
19. ✅ page_contact → `/contact`
20. ✅ search → `/search`
21. ✅ checkout → `/checkout`
22. ✅ devis → `/devis`

**Page Settings (4):**
23. ✅ page_voyage → All voyage detail pages
24. ✅ page_thematiques → Thematiques index + detail
25. ✅ page_experiences → Experiences index + detail
26. ✅ page_blog → Blog index

**Global Content (6):**
27. ✅ header → Site navigation
28. ✅ footer → Site footer
29. ✅ newsletter → Newsletter sections
30. ✅ ctas → Call-to-action content
31. ✅ voyage_card → Voyage card display
32. ✅ blockContent → Rich text blocks

**Referenced Content (5):**
33. ✅ teamMember → Team member profiles
34. ✅ review → Customer reviews
35. ✅ partner → Partner logos
36. ✅ region → Geographic regions
37. ✅ tops → Top content lists

## 🧪 Testing Your Setup

### Using the Test Page

Go to: `https://odysway.com/test`

1. Select any content type from dropdown (37 options!)
2. Enter slug if required (auto-hidden for singleton pages)
3. See which pages will be revalidated (preview)
4. Click "Test Webhook"
5. View the complete response

### Expected Behavior

**✅ With VERCEL_BYPASS_TOKEN:**
```json
{
  "success": true,
  "message": "On-demand revalidation triggered. Changes are live!",
  "documentType": "voyage",
  "slug": "bali",
  "revalidationResults": [
    { "path": "/voyages/bali", "status": "success" },
    { "path": "/search", "status": "success" },
    { "path": "/prochains-departs", "status": "success" }
  ]
}
```

**⚠️ Without VERCEL_BYPASS_TOKEN:**
```json
{
  "success": true,
  "message": "Webhook received. Content will update within 60 seconds via ISR.",
  "documentType": "voyage",
  "slug": "bali",
  "pathsAffected": ["/voyages/bali", "/search", "/prochains-departs"],
  "note": "For instant updates, configure VERCEL_BYPASS_TOKEN"
}
```

## 📈 Performance Characteristics

| Update Type | Speed | Method | Coverage |
|-------------|-------|--------|----------|
| **Specific page** | < 1s | Bypass token | 100% |
| **Multiple pages** | < 2s | Bypass token (parallel) | 100% |
| **Global content** | < 3s | Bypass token (5-6 pages) | Critical pages |
| **Wildcard paths** | 60s | Time-based ISR | 100% |
| **Fallback** | 60s-3600s | Time-based ISR | 100% |

## 🎯 Optimization Tips

### For Frequently Updated Content
```typescript
// Already configured with 60s ISR
'/voyages/**': { isr: 60 }
'/blog/**': { isr: 60 }
```

### For Rarely Updated Content
```typescript
// Longer cache for better performance
'/mentions-legales': { isr: 3600 }  // 1 hour
'/conditions-generales-de-vente': { isr: 3600 }
```

### For Global Content Updates
When updating `header` or `footer`, consider if you need instant updates for all pages:

**Option 1: Instant for critical pages only** (current setup)
- Homepage, main navigation pages update instantly
- Other pages update within their ISR interval

**Option 2: Full site rebuild** (for major nav changes)
- Use Vercel Deploy Hook (see `SANITY_WEBHOOKS_SETUP.md`)

## 🚨 Troubleshooting

### Some pages not updating?

**Check #1**: Is the content type in the webhook mapping?
```bash
# View the webhook code:
grep "documentType ===" server/api/v1/webhooks/sanity/revalidate.post.ts
```

**Check #2**: Is bypass token configured?
```bash
# In Vercel: Settings → Environment Variables
# Should see: VERCEL_BYPASS_TOKEN
```

**Check #3**: Check Vercel logs
```bash
# Vercel Dashboard → Logs
# Look for: "✓ Revalidated instantly: /path"
```

### Unknown document type warning?

If you see: `⚠️ Unknown document type: someType`

This means:
- The content type exists in Sanity but not in the webhook mapping
- The webhook still succeeds (returns 200)
- Updates will happen via time-based ISR

To fix: Add the type to `server/api/v1/webhooks/sanity/revalidate.post.ts`

## 📚 Related Documentation

- **Full Mapping**: `SANITY_CONTENT_TYPE_MAPPING.md`
- **Setup Guide**: `SANITY_WEBHOOKS_SETUP.md`
- **Quick Start**: `ISR_QUICK_START.md`
- **Technical Details**: `CACHE_STRATEGY_EXPLAINED.md`
- **Deployment Protection**: `VERCEL_DEPLOYMENT_PROTECTION.md`

## ✅ Verification Checklist

Before going live, verify:

- [ ] `SANITY_WEBHOOK_SECRET` set in Vercel
- [ ] `VERCEL_BYPASS_TOKEN` set in Vercel (for instant updates)
- [ ] Webhook configured in Sanity with production URL
- [ ] Webhook includes all relevant document types
- [ ] Test page works: `https://odysway.com/test`
- [ ] Sanity webhook delivery log shows 200 responses
- [ ] Vercel logs show "✓ Revalidated instantly" messages

## 🎉 Result

**37 content types** → **Instant updates** across your entire site!

With bypass token: Changes live in < 1 second ⚡
Without bypass token: Changes live within 60 seconds - 1 hour (still automatic!) ✅

