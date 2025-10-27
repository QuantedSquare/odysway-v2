# SEO Slug-Based Defaults

The `useSeo` composable now automatically generates intelligent default titles and descriptions from the page slug when no SEO data is provided.

## How It Works

### Fallback Hierarchy

The composable uses this priority order for titles and descriptions:

```
1. Sanity CMS SEO field (metaTitle, metaDescription)
   ↓
2. Legacy SEO fields (seoTitle, seoDescription)
   ↓
3. Blog-referenced SEO (for destinations/experiences/thematiques)
   ↓
4. Content fields (title, description)
   ↓
5. ⭐ SLUG-BASED GENERATED DEFAULT (NEW!)
```

### Title Generation

**Input:** Slug like `"immersion-japon"` or `"guide-voyage-tokyo"`

**Output:** Human-readable title with branding

```javascript
// Examples:
"immersion-japon"        → "Immersion Japon | Odysway"
"guide-voyage-tokyo"     → "Guide Voyage Tokyo | Odysway"
"voyage-petit-groupe"    → "Voyage Petit Groupe | Odysway"
"decouverte-costa-rica"  → "Decouverte Costa Rica | Odysway"
```

**Algorithm:**
1. Remove file extensions (`.html`, `.htm`)
2. Remove leading/trailing slashes
3. Split by hyphens, underscores, and slashes
4. Capitalize each word
5. Join with spaces
6. Append `" | Odysway"`

### Description Generation

**Input:** Slug + Page Type

**Output:** Contextual description

```javascript
// For article/blog pages:
generateDescriptionFromSlug("guide-voyage-japon", "article")
→ "Découvrez notre article sur guide voyage japon. Guides, conseils et informations pour préparer votre voyage avec Odysway."

// For website pages (default):
generateDescriptionFromSlug("immersion-japon", "website")
→ "Découvrez immersion japon avec Odysway. Voyages en petits groupes et expériences authentiques."

// If no slug:
generateDescriptionFromSlug(null, "website")
→ "Découvrez Odysway, spécialiste des voyages en petits groupes et des expériences authentiques à travers le monde."
```

## Usage Examples

### Example 1: Page with Full SEO Data (Normal Case)

```javascript
useSeo({
  seoData: {
    metaTitle: "Voyage Immersion au Japon - 12 jours",
    metaDescription: "Partez à la découverte du Japon authentique...",
  },
  content: voyage.value,
  slug: "immersion-japon",
})

// Result: Uses provided SEO data
// Title: "Voyage Immersion au Japon - 12 jours"
// Description: "Partez à la découverte du Japon authentique..."
```

### Example 2: Page with NO SEO Data (Uses Slug)

```javascript
useSeo({
  seoData: {}, // Empty!
  content: {}, // No title/description!
  slug: "immersion-japon",
  pageType: "website",
})

// Result: Generates from slug
// Title: "Immersion Japon | Odysway"
// Description: "Découvrez immersion japon avec Odysway. Voyages en petits groupes et expériences authentiques."
```

### Example 3: Page with Only Content Title

```javascript
useSeo({
  seoData: {},
  content: {
    title: "Voyage au Japon", // Has title
    // No description
  },
  slug: "immersion-japon",
})

// Result: Uses content.title for title, generates description from slug
// Title: "Voyage au Japon" (from content)
// Description: "Découvrez immersion japon avec Odysway..." (from slug)
```

### Example 4: Blog Post with Slug

```javascript
useSeo({
  seoData: {},
  content: {},
  slug: "guide-voyage-tokyo",
  pageType: "article", // Important for description template
})

// Result:
// Title: "Guide Voyage Tokyo | Odysway"
// Description: "Découvrez notre article sur guide voyage tokyo. Guides, conseils et informations..."
```

### Example 5: Complex Slug

```javascript
useSeo({
  seoData: {},
  content: {},
  slug: "costa-rica/voyage-aventure",
})

// Result:
// Title: "Costa Rica Voyage Aventure | Odysway"
// Description: "Découvrez costa rica voyage aventure avec Odysway..."
```

## When This Helps

### ✅ Great For:

1. **Development/Testing** - Quickly see pages without manually adding SEO
2. **New Pages** - Reasonable defaults before SEO team optimizes
3. **Backup Safety** - Never show completely empty titles
4. **CMS Migration** - Pages missing SEO data still have something

### 🎯 Production Use:

**Important:** While these defaults are better than nothing, they should **not** be your final SEO strategy!

**Always aim to:**
- ✅ Set proper `metaTitle` in Sanity CMS (under 60 chars)
- ✅ Set proper `metaDescription` in Sanity CMS (under 160 chars)
- ✅ Optimize for target keywords
- ✅ Write compelling copy that encourages clicks

**These slug-based defaults are a safety net, not a substitute for good SEO!**

## Real-World Examples

### Voyage Page

```javascript
// With SEO data (BEST):
useSeo({
  seoData: {
    metaTitle: "Immersion Japon - 12 jours en petit groupe",
    metaDescription: "Découvrez le Japon authentique lors de ce voyage de 12 jours...",
  },
  slug: "immersion-japon",
})
// → Uses optimized SEO data ✅

// Without SEO data (BACKUP):
useSeo({
  seoData: {},
  slug: "immersion-japon",
})
// → "Immersion Japon | Odysway"
// → "Découvrez immersion japon avec Odysway..."
// Still better than empty! ⚠️
```

### Blog Post

```javascript
// With SEO data (BEST):
useSeo({
  seoData: {
    seoTitle: "Guide complet du Japon : 10 choses à savoir",
    seoDescription: "Préparez votre voyage au Japon avec notre guide complet...",
  },
  slug: "guide-voyage-japon",
  pageType: "article",
})
// → Uses optimized SEO data ✅

// Without SEO data (BACKUP):
useSeo({
  seoData: {},
  slug: "guide-voyage-japon",
  pageType: "article",
})
// → "Guide Voyage Japon | Odysway"
// → "Découvrez notre article sur guide voyage japon. Guides, conseils..."
// Functional but not ideal ⚠️
```

## Debug Console Output

When viewing pages in development, you'll see in console if defaults were used:

```javascript
🔍 SEO Debug - Immersion Japon | Odysway  ← Generated from slug
  📄 Page Info: {
    type: "website",
    slug: "immersion-japon",
    path: "/voyages/immersion-japon"
  }
  📝 Meta Tags: {
    title: "Immersion Japon | Odysway",  ← From slug
    description: "Découvrez immersion japon avec Odysway...",  ← From slug
    canonical: "https://odysway.com/voyages/immersion-japon",
    robots: "index, follow"
  }
```

## Customizing Templates

If you want to change the default templates, modify the functions in `composables/useSeo.js`:

```javascript
// Current template for website pages:
`Découvrez ${cleanSlug} avec Odysway. Voyages en petits groupes et expériences authentiques.`

// Current template for article pages:
`Découvrez notre article sur ${cleanSlug}. Guides, conseils et informations pour préparer votre voyage avec Odysway.`
```

You can add more page-type-specific templates:

```javascript
const templates = {
  article: `Article template...`,
  website: `Website template...`,
  voyage: `Voyage template...`,  // Add custom
  destination: `Destination template...`,  // Add custom
}

return templates[pageType] || templates.website
```

## Edge Cases

### No Slug Provided

```javascript
useSeo({
  seoData: {},
  content: {},
  slug: null, // or undefined
})

// Result:
// Title: "Odysway"
// Description: "Découvrez Odysway, spécialiste des voyages en petits groupes..."
```

### Slug with Special Characters

```javascript
useSeo({
  slug: "voyage_costa-rica/aventure",
})

// Result:
// Title: "Voyage Costa Rica Aventure | Odysway"
// Handles hyphens, underscores, and slashes
```

### Very Long Slug

```javascript
useSeo({
  slug: "guide-complet-voyage-japon-tokyo-kyoto-osaka",
})

// Result:
// Title: "Guide Complet Voyage Japon Tokyo Kyoto Osaka | Odysway"
// Warning: May exceed 60 character recommendation!
// Better to set proper metaTitle in CMS
```

## Best Practices

### ✅ DO:

1. **Use slug-based defaults during development**
   ```javascript
   // Quick prototyping - fine!
   useSeo({ slug: "new-page" })
   ```

2. **Add proper SEO before production**
   ```javascript
   // Production-ready
   useSeo({
     seoData: voyage.value.seo, // From CMS
     slug: voyage.value.slug,
   })
   ```

3. **Use descriptive slugs**
   ```javascript
   // Good slug = better default
   "immersion-japon" ✅
   "voyage1234" ❌
   ```

### ❌ DON'T:

1. **Rely on defaults in production**
   - Always set proper SEO in Sanity CMS

2. **Use generic slugs**
   - Bad: `"page1"`, `"test"`, `"new"`
   - Good: `"voyage-japon"`, `"guide-tokyo"`

3. **Skip SEO optimization**
   - Slug-based titles won't rank as well as optimized ones

## Migration Checklist

When launching pages to production:

- [ ] Check all pages have proper `metaTitle` in Sanity
- [ ] Check all pages have proper `metaDescription` in Sanity
- [ ] Verify titles are under 60 characters
- [ ] Verify descriptions are under 160 characters
- [ ] Test titles/descriptions in Google preview tools
- [ ] Check console logs for any pages using slug-based defaults
- [ ] Optimize those pages with proper SEO data

## Summary

✅ **Slug-based defaults provide:**
- Safety net for missing SEO data
- Better development experience
- Functional titles/descriptions for new pages

⚠️ **But remember:**
- They're not a replacement for proper SEO
- Always optimize for production
- Use descriptive slugs for better defaults

🎯 **Goal:**
Zero pages should use slug-based defaults in production! They're a backup, not the strategy.

