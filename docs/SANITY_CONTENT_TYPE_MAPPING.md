# Sanity Content Types → Pages Mapping

This document maps each Sanity CMS schema type to the pages it affects and the revalidation strategy.

## Content Types with Dynamic Pages (Have Slugs)

These content types have their own dedicated pages with dynamic URLs:

| Schema Type | Page URL | ISR Cache | Instant Revalidation | Also Affects |
|-------------|----------|-----------|---------------------|--------------|
| **voyage** | `/voyages/[slug]` | 60s | ✅ Yes | `/search`, `/prochains-departs` |
| **blog** | `/[blogSlug]` | 60s | ✅ Yes | `/blog` (index) |
| **destination** | `/destinations/[slug]` | 60s | ✅ Yes | `/destinations` (index), `/search` |
| **category** | `/thematiques/[slug]` | 60s | ✅ Yes | `/thematiques` (index) |
| **experience** | `/experiences/[slug]` | 60s | ✅ Yes | `/experiences` (index) |

## Singleton Pages (Fixed URLs)

These content types map to specific, single pages:

| Schema Type | Page URL | ISR Cache | Instant Revalidation |
|-------------|----------|-----------|---------------------|
| **homePage** | `/` | 60s | ✅ Yes |
| **entreprise** | `/entreprise` | 5min | ✅ Yes |
| **surMesure** | `/sur-mesure` | 5min | ✅ Yes |
| **visionVoyageOdysway** | `/vision-voyage-odysway` | 5min | ✅ Yes |
| **privacyPolicy** | `/politique-de-confidentialite` | 1hr | ✅ Yes |
| **legalMentions** | `/mentions-legales` | 1hr | ✅ Yes |
| **chequesVacances** | `/cheques-vacances` | 1hr | ✅ Yes |
| **conditionsGeneralesVente** | `/conditions-generales-de-vente` | 1hr | ✅ Yes |
| **confirmation** | `/confirmation` | 1hr | ✅ Yes |
| **offreCadeau** | `/offre-cadeau` | 5min | ✅ Yes |
| **recruitment** | `/nous-recrutons` | 5min | ✅ Yes |
| **faq** | `/faq` | 5min | ✅ Yes |
| **avisVoyageurs** | `/avis-voyageurs` | 5min | ✅ Yes |
| **page_contact** | `/contact` | 5min | ✅ Yes |
| **search** | `/search` | 60s | ✅ Yes |
| **checkout** | `/checkout` | 5min | ✅ Yes |
| **devis** | `/devis` | 5min | ✅ Yes |

## Page Settings Types (Shared Content)

These types provide content used across multiple pages:

| Schema Type | Used In Pages | ISR Cache | Revalidation Strategy |
|-------------|---------------|-----------|----------------------|
| **page_voyage** | All `/voyages/[slug]` pages | 60s | ⚠️ Time-based only (can't target all) |
| **page_thematiques** | `/thematiques` + all category pages | 60s | ✅ Index page only |
| **page_experiences** | `/experiences` + all experience pages | 60s | ✅ Index page only |
| **page_blog** | `/blog` (index page) | 60s | ✅ Yes |

## Global Content Types (Affect Multiple Pages)

These types are used across the entire site:

| Schema Type | Impact | Revalidated Pages | Strategy |
|-------------|--------|-------------------|----------|
| **header** | Navigation on all pages | `/`, `/destinations`, `/thematiques`, `/experiences`, `/blog` | Partial revalidation |
| **footer** | Footer on all pages | `/`, `/contact` | Partial revalidation |
| **newsletter** | Newsletter sections | `/` | Homepage only |
| **ctas** | Call-to-actions | `/` | Homepage only |
| **voyage_card** | Voyage listings | `/search`, `/destinations`, `/thematiques`, `/experiences` | All listing pages |

## Referenced Content Types (No Direct Pages)

These types are referenced by other documents but don't have their own pages:

| Schema Type | Referenced By | Affected Pages | Revalidation |
|-------------|---------------|----------------|--------------|
| **teamMember** | voyages, visionVoyageOdysway | `/vision-voyage-odysway` | ✅ Yes |
| **review** | homePage, voyages | `/`, `/avis-voyageurs` | ✅ Yes |
| **partner** | homePage | Not currently revalidated | ⚠️ Via ISR only |
| **region** | destinations | `/destinations`, `/search` | ⚠️ Via ISR only |
| **tops** | Various pages | Not currently revalidated | ⚠️ Via ISR only |

## How the Webhook Works

### When you publish content in Sanity:

1. **Sanity sends webhook** → `POST /api/v1/webhooks/sanity/revalidate`
2. **Webhook identifies content type** from `body._type`
3. **Determines affected pages** based on the mapping above
4. **Triggers revalidation** using one of two methods:

   **Method A: Instant (with VERCEL_BYPASS_TOKEN)**
   - Sends HEAD request with `x-prerender-revalidate` header
   - Page regenerates immediately (< 1 second)
   - Used for specific, known paths

   **Method B: Time-based ISR (fallback)**
   - Relies on configured ISR duration
   - Page regenerates on next visit after cache expires
   - Used when bypass token not configured or for wildcard paths

## Special Cases

### Voyages Update Strategy

When a `voyage` document is published:
```
✅ Instant: /voyages/specific-slug
✅ Instant: /search
✅ Instant: /prochains-departs
⚠️ Time-based: Related destination/category pages (60s)
```

### Global Content Update Strategy

When `header` or `footer` is updated:
```
✅ Instant: Main navigation pages
⚠️ Time-based: All other pages (60s-3600s depending on ISR config)
```

### Page Settings Update Strategy

When `page_voyage`, `page_thematiques`, or `page_experiences` is updated:
```
⚠️ Time-based only: Can't use wildcards with bypass token
All affected pages update within their ISR interval (60s)
```

## ISR Cache Duration Strategy

We use different cache durations based on update frequency:

- **60s** - Frequently updated content (voyages, blog, destinations)
- **300s (5min)** - Occasionally updated (static pages, forms)
- **3600s (1hr)** - Rarely updated (legal pages, T&Cs)

## Webhook Configuration in Sanity

Configure your webhook to trigger on these document types:

### High Priority (Frequent Updates)
- ✅ voyage
- ✅ blog  
- ✅ destination
- ✅ category
- ✅ experience
- ✅ homePage

### Medium Priority (Occasional Updates)
- ✅ entreprise
- ✅ surMesure
- ✅ visionVoyageOdysway
- ✅ faq
- ✅ avisVoyageurs
- ✅ page_contact
- ✅ search
- ✅ offreCadeau
- ✅ recruitment

### Low Priority (Rare Updates)
- ✅ privacyPolicy
- ✅ legalMentions
- ✅ conditionsGeneralesVente
- ✅ chequesVacances
- ✅ confirmation

### Global Content (Important!)
- ✅ header
- ✅ footer
- ✅ newsletter
- ✅ ctas
- ✅ voyage_card
- ✅ page_voyage
- ✅ page_thematiques
- ✅ page_experiences
- ✅ page_blog

### Referenced Content
- ✅ teamMember
- ✅ review
- ⚠️ partner (optional)
- ⚠️ region (optional)
- ⚠️ tops (optional)

## Monitoring

### Check which pages are being revalidated:

```bash
# View Vercel logs
# Look for these log messages:

✓ Revalidated instantly: /voyages/bali
⚠️  Header updated - revalidating main navigation pages
ℹ️  page_voyage updated - all voyage pages will update within 60s via ISR
⚠️  Unknown document type: someType
```

### Test specific content types:

```bash
# Test voyage update
curl -X POST https://odysway.com/api/v1/webhooks/sanity/revalidate \
  -H "x-sanity-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"_type":"voyage","slug":{"current":"bali"}}'

# Test singleton page update
curl -X POST https://odysway.com/api/v1/webhooks/sanity/revalidate \
  -H "x-sanity-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"_type":"entreprise"}'

# Test global content update
curl -X POST https://odysway.com/api/v1/webhooks/sanity/revalidate \
  -H "x-sanity-webhook-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"_type":"header"}'
```

## Summary

✅ **37 content types** mapped to pages
✅ **Instant revalidation** for all direct pages (with bypass token)
✅ **Cascading updates** for related content
✅ **Optimized ISR durations** based on update frequency

## Files

- Implementation: `server/api/v1/webhooks/sanity/revalidate.post.ts`
- ISR Config: `nuxt.config.ts` (routeRules)
- Schema Types: `cms/schemaTypes/`

