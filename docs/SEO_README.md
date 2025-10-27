# SEO Composable - Quick Start Guide

## Overview

A centralized, reusable SEO solution for all page types in the Odysway application.

## Files Created

```
composables/useSeo.js           # Main SEO composable
utils/structuredData.js         # Structured data helpers
docs/SEO_COMPOSABLE_USAGE.md    # Detailed usage guide
docs/SEO_MIGRATION_SUMMARY.md   # Migration tracking
```

## Quick Example

### Before (Old Way)
```vue
<script setup>
// 80+ lines of repetitive SEO code
const seo = data.value.seo || {}
const metaTitle = seo.metaTitle || data.value.title || 'Default'
// ... many more lines ...

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  // ... 20+ more fields ...
})

useHead({
  // ... more config ...
  script: [
    { type: 'application/ld+json', children: JSON.stringify(/* ... */) }
  ]
})
</script>
```

### After (New Way)
```vue
<script setup>
// Just 8 lines!
useSeo({
  seoData: data.value.seo,
  content: data.value,
  pageType: 'website',
  slug: data.value.slug?.current,
  structuredData: createOrganizationSchema(),
})
</script>
```

## Simple Usage

### Homepage
```javascript
useSeo({
  seoData: homeSanity.value.seo,
  content: { title: 'Odysway', image: heroImage },
  pageType: 'website',
  slug: 'home',
  structuredData: [
    createOrganizationSchema(),
    createWebSiteSchema()
  ]
})
```

### Blog Post
```javascript
useSeo({
  seoData: blog.value,
  content: blog.value,
  pageType: 'article',
  slug: blog.value.slug?.current,
  structuredData: createBlogPostingSchema(blog.value, url)
})
```

### Destination/Experience/Thematique (with blog reference)
```javascript
useSeo({
  seoData: {}, // Blog SEO auto-detected from content.blog
  content: destination.value,
  pageType: 'article',
  slug: destination.value.slug?.current,
  structuredData: destination.value.blog 
    ? createBlogPostingSchema(destination.value.blog, url)
    : null
})
```

### Voyage
```javascript
useSeo({
  seoData: voyage.value.seoSection,
  content: voyage.value,
  pageType: 'website',
  slug: voyage.value.slug?.current,
  structuredData: createTouristTripSchema(voyage.value, url),
  breadcrumbs: [
    { name: 'Accueil', url: 'https://odysway.com' },
    { name: 'Voyages', url: 'https://odysway.com/voyages' },
    { name: voyage.value.title, url }
  ]
})
```

## GROQ Query for SEO

Include these fields in your Sanity queries:

```groq
*[_type == "yourType"][0]{
  ...,
  seo{
    metaTitle,
    metaDescription,
    canonicalUrl,
    focusKeyword,
    keywords,
    robotsIndex,
    robotsFollow,
    ogTitle,
    ogDescription,
    ogImage{
      asset->{ _ref, _id, url },
      alt
    }
  }
}
```

## Structured Data Functions

All available in `utils/structuredData.js`:

| Function | Use Case |
|----------|----------|
| `createOrganizationSchema()` | Homepage, company pages |
| `createWebSiteSchema()` | Homepage with search |
| `createBlogPostingSchema()` | Blog posts, articles |
| `createTouristTripSchema()` | Voyage pages |
| `createBreadcrumbSchema()` | Manual breadcrumbs |
| `createFAQPageSchema()` | FAQ pages |

## What It Handles Automatically

✅ **Field mapping** - Works with metaTitle, seoTitle, or any naming  
✅ **Image URLs** - Generates proper Sanity image URLs with SEO names  
✅ **Robots meta** - Converts robotsIndex/Follow booleans to meta tags  
✅ **Fallbacks** - Uses content fields if SEO fields are missing  
✅ **Blog references** - Detects and uses blog SEO for destination/experience/thematique pages  
✅ **Canonical URLs** - Generates proper canonical URLs  
✅ **Keywords** - Handles both arrays and comma-separated strings  
✅ **Open Graph** - All OG tags with proper images  
✅ **Twitter Cards** - Full Twitter meta tags  
✅ **Structured data** - Injects Schema.org JSON-LD  
✅ **Breadcrumbs** - Automatic breadcrumb structured data  

## Migrated Pages

- ✅ Homepage (`pages/index.vue`)
- ✅ Blog posts (`pages/[blogSlug].vue`)
- ✅ Destinations (`pages/destinations/[destinationSlug].vue`)
- ✅ Thématiques (`pages/thematiques/[thematiqueSlug].vue`)
- ✅ Experiences (`pages/experiences/[experienceSlug].vue`)

## Full Documentation

- **Usage Guide**: `/docs/SEO_COMPOSABLE_USAGE.md`
- **Migration Tracking**: `/docs/SEO_MIGRATION_SUMMARY.md`

## Need Help?

Check the documentation files above for:
- Complete examples for every page type
- Migration checklist
- Testing instructions
- Troubleshooting tips

