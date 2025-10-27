# SEO Debug Logging Guide

The `useSeo` composable now includes automatic debug logging on the client side to help you verify and troubleshoot SEO implementations.

## What Gets Logged

When you open your browser's developer console, you'll see grouped logs like this:

```
🔍 SEO Debug - Your Page Title
  📄 Page Info: { type, slug, path }
  📝 Meta Tags: { title, description, canonical, robots }
  🖼️ Open Graph: { ogTitle, ogDescription, ogImage, ogImageAlt, ogType }
  🐦 Twitter Card: { twitterTitle, twitterCard, twitterImage }
  🔑 Keywords: [array of keywords]
  🎯 Focus Keyword: "main keyword"
  📊 Structured Data (2 schemas): ['Organization', 'WebSite']
    1. Organization: { full schema object }
    2. WebSite: { full schema object }
  🍞 Breadcrumbs: Accueil → Voyages → Japan
```

## Example Output

### Homepage Example

```javascript
🔍 SEO Debug - Odysway - Voyages en Petits Groupes
  📄 Page Info: {
    type: "website",
    slug: "home",
    path: "/"
  }
  
  📝 Meta Tags: {
    title: "Odysway - Voyages en Petits Groupes et Expériences Authentiques",
    description: "Découvrez nos voyages en petits groupes à travers le monde. Expériences authentiques...",
    canonical: "https://odysway.com/",
    robots: "index, follow"
  }
  
  🖼️ Open Graph: {
    ogTitle: "Odysway - Voyages en Petits Groupes",
    ogDescription: "Découvrez nos voyages en petits groupes...",
    ogImage: "https://cdn.sanity.io/images/.../home.jpg",
    ogImageAlt: "Odysway - Voyages en petits groupes",
    ogType: "website"
  }
  
  🐦 Twitter Card: {
    twitterTitle: "Odysway - Voyages en Petits Groupes",
    twitterCard: "summary_large_image",
    twitterImage: "https://cdn.sanity.io/images/.../home.jpg"
  }
  
  🔑 Keywords: ["voyage", "petit groupe", "authentique", "aventure"]
  
  🎯 Focus Keyword: "voyage en petit groupe"
  
  📊 Structured Data (2 schemas): ['Organization', 'WebSite']
    1. Organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Odysway",
      "url": "https://odysway.com",
      ...
    }
    2. WebSite: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Odysway",
      ...
    }
```

### Blog Post Example

```javascript
🔍 SEO Debug - Guide complet du voyage au Japon
  📄 Page Info: {
    type: "article",
    slug: "guide-voyage-japon",
    path: "/guide-voyage-japon"
  }
  
  📝 Meta Tags: {
    title: "Guide complet du voyage au Japon",
    description: "Découvrez notre guide complet pour préparer votre voyage au Japon...",
    canonical: "https://odysway.com/guide-voyage-japon",
    robots: "index, follow"
  }
  
  🖼️ Open Graph: {
    ogTitle: "Guide complet du voyage au Japon",
    ogDescription: "Découvrez notre guide complet...",
    ogImage: "https://cdn.sanity.io/images/.../guide-voyage-japon.jpg",
    ogImageAlt: "Guide complet du voyage au Japon",
    ogType: "article"
  }
  
  🐦 Twitter Card: {
    twitterTitle: "Guide complet du voyage au Japon",
    twitterCard: "summary_large_image",
    twitterImage: "https://cdn.sanity.io/images/.../guide-voyage-japon.jpg"
  }
  
  🔑 Keywords: ["Japon", "guide", "voyage", "Tokyo", "Kyoto"]
  
  📊 Structured Data (1 schemas): ['BlogPosting']
    1. BlogPosting: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Guide complet du voyage au Japon",
      ...
    }
  
  🍞 Breadcrumbs: Blog → Guide complet du voyage au Japon
```

### Voyage Page Example

```javascript
🔍 SEO Debug - Immersion au Japon - 12 jours
  📄 Page Info: {
    type: "website",
    slug: "immersion-japon",
    path: "/voyages/immersion-japon"
  }
  
  📝 Meta Tags: {
    title: "Immersion au Japon - 12 jours | Voyage en petit groupe",
    description: "Partez à la découverte du Japon authentique lors de ce voyage de 12 jours...",
    canonical: "https://odysway.com/voyages/immersion-japon",
    robots: "index, follow"
  }
  
  🖼️ Open Graph: {
    ogTitle: "Immersion au Japon - 12 jours",
    ogDescription: "Partez à la découverte du Japon authentique...",
    ogImage: "https://cdn.sanity.io/images/.../immersion-japon.jpg",
    ogImageAlt: "Immersion au Japon",
    ogType: "website"
  }
  
  🐦 Twitter Card: {
    twitterTitle: "Immersion au Japon - 12 jours",
    twitterCard: "summary_large_image",
    twitterImage: "https://cdn.sanity.io/images/.../immersion-japon.jpg"
  }
  
  📊 Structured Data (1 schemas): ['TouristTrip']
    1. TouristTrip: {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      "name": "Immersion au Japon - 12 jours",
      "offers": {
        "@type": "Offer",
        "price": 2890,
        "priceCurrency": "EUR"
      },
      ...
    }
  
  🍞 Breadcrumbs: Accueil → Voyages → Immersion au Japon - 12 jours
```

## How to Use the Logs

### 1. Open Developer Console

**Chrome/Edge:**
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Go to "Console" tab

**Firefox:**
- Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)

**Safari:**
- Enable Developer menu: Safari → Preferences → Advanced → "Show Develop menu"
- Press `Cmd+Option+C`

### 2. Navigate to Any Page

The SEO logs will appear automatically when the page loads (client-side only).

### 3. Click to Expand Groups

Click on the collapsed groups (▶️) to see detailed information.

### 4. Inspect Structured Data

The full structured data objects are logged so you can:
- Copy them to validate in [Google's Rich Results Test](https://search.google.com/test/rich-results)
- Verify all fields are populated correctly
- Check for missing data

## What to Check For

### ✅ Good SEO Implementation

```javascript
✅ Title exists and is under 60 characters
✅ Description exists and is under 160 characters
✅ Canonical URL is correct
✅ Robots is "index, follow" (unless intentionally different)
✅ OG image URL loads (check in new tab)
✅ OG image alt text is meaningful
✅ Keywords are relevant
✅ Structured data has correct @type
✅ Breadcrumbs show correct hierarchy
```

### ❌ Issues to Fix

```javascript
❌ Title is "undefined" or empty
❌ Description is truncated badly (cut mid-word)
❌ OG image URL returns 404
❌ Robots is "noindex" on public pages
❌ Canonical URL is wrong domain
❌ Structured data is null or empty
❌ @type is incorrect for page type
❌ Missing required fields in structured data
```

## Common Issues & Solutions

### Issue: Title Shows "undefined"
**Cause:** Missing SEO data and fallback content
**Solution:** Check that either `seoData.metaTitle` or `content.title` is provided

### Issue: OG Image Shows Default Logo
**Cause:** No image provided in SEO data or content
**Solution:** Add `ogImage` to SEO data or `image` to content object

### Issue: Structured Data Not Showing
**Cause:** `structuredData` option not passed to `useSeo()`
**Solution:** Add structured data creation function to `useSeo()` call

### Issue: Breadcrumbs Missing
**Cause:** `breadcrumbs` array not provided
**Solution:** Add breadcrumbs array to `useSeo()` call

### Issue: Description Cut Off at "..."
**Cause:** Log truncates at 100 characters for readability
**Solution:** This is normal - full description is in the actual meta tags

## Verifying in Browser

After checking the console logs, verify the actual meta tags:

### 1. View Page Source
```
Right-click → "View Page Source"
Look for <meta> tags in <head>
```

### 2. Inspect Head Element
```
DevTools → Elements → <head>
Expand to see all meta tags
```

### 3. Check JSON-LD Scripts
```
DevTools → Elements → <head>
Look for: <script type="application/ld+json">
Copy and paste into JSON validator
```

## Testing Tools

### Google Tools
- **Rich Results Test:** https://search.google.com/test/rich-results
- **Search Console:** https://search.google.com/search-console

### Social Media
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

### Schema.org
- **Schema Validator:** https://validator.schema.org/

## Disabling Logs (Future)

If you want to disable these logs in production, you can wrap them with an environment check:

```javascript
// In useSeo.js (future enhancement)
if (import.meta.client && import.meta.dev) {
  // Logs only in development
}
```

Or set an environment variable:
```javascript
if (import.meta.client && process.env.SEO_DEBUG === 'true') {
  // Logs only when SEO_DEBUG is enabled
}
```

## Tips

1. **Test Every Page Type** - Make sure logs appear correctly for homepage, blog posts, voyages, etc.
2. **Check Images Load** - Copy OG image URLs and test in browser
3. **Validate Structured Data** - Copy JSON-LD and validate with Google's tool
4. **Test on Mobile** - Use mobile DevTools to check on smaller screens
5. **Check Social Previews** - Use Facebook/Twitter debuggers to see how links appear

## Example Debugging Session

```bash
1. Navigate to homepage
2. Open console
3. See: "🔍 SEO Debug - Odysway - Voyages en Petits Groupes"
4. Expand all groups
5. Check:
   ✅ Title looks good
   ✅ Description is compelling
   ✅ Image URL works
   ✅ 2 structured data schemas: Organization, WebSite
6. Copy Organization schema
7. Paste into https://search.google.com/test/rich-results
8. Verify it's valid
9. Move to next page...
```

## Need Help?

If something doesn't look right in the logs:
1. Check the page's `useSeo()` call
2. Verify data is being fetched from Sanity
3. Check console for errors
4. Compare with working examples in `/docs/SEO_COMPOSABLE_USAGE.md`

