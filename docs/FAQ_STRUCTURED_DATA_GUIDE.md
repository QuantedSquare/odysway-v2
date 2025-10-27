# FAQ Structured Data Guide

This guide explains how to add FAQ structured data (Schema.org FAQPage) to your pages.

## Overview

FAQ structured data helps search engines understand your Q&A content and can result in rich results in Google Search with expandable answers.

## Files Created

- **`/utils/portableTextToPlain.js`** - Converts Portable Text (Sanity's rich text format) to plain text
- **`/composables/useFaqData.js`** - Composable to fetch FAQ data for structured data
- Updated **`/utils/structuredData.js`** - Enhanced `createFAQPageSchema()` to handle Portable Text

## How It Works

1. FAQ questions and answers are stored in Sanity CMS
2. Answers are in Portable Text format (rich text with formatting)
3. For structured data, we convert Portable Text to plain text
4. The FAQ schema is added to the page's `<head>` section

## Usage Examples

### 1. FAQ Page (Full Implementation)

The `/faq` page includes all FAQs with structured data:

```vue
<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()

definePageMeta({
  layout: 'no-faq',
})

// Fetch FAQ data for SEO structured data
const { getFaqsForSchema } = await useFaqData({
  includeHidden: true, // Include all FAQs on the FAQ page
})

// Add SEO with FAQ structured data
useSeo({
  seoData: {},
  content: {
    title: 'FAQ - Questions fréquentes | Odysway',
    description: 'Retrouvez les réponses aux questions les plus fréquentes...',
  },
  pageType: 'website',
  slug: 'faq',
  structuredData: createFAQPageSchema(getFaqsForSchema.value),
})
</script>
```

### 2. Homepage (Limited FAQs)

If you want to add FAQ schema to the homepage with only visible FAQs:

```vue
<script setup>
// ... other code ...

// Optionally add FAQ structured data to homepage
const { getFaqsForSchema } = await useFaqData({
  includeHidden: false, // Only show non-hidden FAQs
  limit: 5, // Limit to 5 most important FAQs
})

useSeo({
  seoData: homeSanity.value.seo,
  content: defaultContent,
  pageType: 'website',
  slug: 'home',
  baseUrl: '/',
  structuredData: [
    createOrganizationSchema({ description: /* ... */ }),
    createWebSiteSchema(),
    createFAQPageSchema(getFaqsForSchema.value), // Add FAQ schema
  ],
})
</script>
```

### 3. Voyage Page (Voyage-Specific FAQs)

If a voyage has its own FAQ section, you can add those:

```vue
<script setup>
watchEffect(() => {
  if (!voyage.value) return

  // If voyage has FAQ items
  const voyageFaqs = voyage.value.faqBlock?.map(item => ({
    question: item.question,
    answer: item.answer, // Portable Text
  }))

  useSeo({
    seoData: voyage.value.seo,
    content: voyage.value,
    pageType: 'website',
    slug: voyage.value.slug?.current,
    structuredData: [
      createTouristTripSchema(voyage.value, url),
      createFAQPageSchema(voyageFaqs), // Add voyage FAQs
    ],
    breadcrumbs: [/* ... */],
  })
})
</script>
```

## API Reference

### `useFaqData(options)`

Fetches FAQ data from Sanity CMS.

**Options:**
- `includeHidden` (Boolean, default: `false`) - Include hidden FAQs
- `limit` (Number, default: `null`) - Limit number of FAQs returned

**Returns:**
```javascript
{
  faqData: Ref<Object>,        // Raw FAQ data from Sanity
  getFaqsForSchema: Ref<Array> // FAQs formatted for Schema.org
}
```

### `createFAQPageSchema(faqs)`

Creates FAQPage structured data.

**Parameters:**
- `faqs` (Array) - FAQ items in format:
  ```javascript
  [
    {
      question: 'Question text',
      answer: 'Answer text' // Can be string or Portable Text array
    }
  ]
  ```

**Returns:**
- FAQPage schema object or `null` if no FAQs

### `portableTextToPlain(portableTextBlocks)`

Converts Portable Text to plain text string.

**Parameters:**
- `portableTextBlocks` (Array) - Portable Text blocks from Sanity

**Returns:**
- Plain text string

## Best Practices

### 1. When to Add FAQ Structured Data

✅ **Do add on:**
- Dedicated FAQ page
- Product pages with FAQs (voyage pages)
- Service pages with FAQs

❌ **Don't add on:**
- Pages without any FAQ content
- Pages with only 1-2 questions (not really an FAQ)

### 2. Number of FAQs

- **Minimum:** 3-5 questions for best results
- **Recommended:** 5-15 questions per page
- **Maximum:** No hard limit, but keep relevant

### 3. Question and Answer Quality

**Questions should:**
- Start with question words (How, What, When, etc.)
- Be specific and clear
- Reflect actual user queries

**Answers should:**
- Be concise but complete
- Provide direct answers first
- Include relevant details

### 4. Duplicate Content

- Don't add the same FAQ to multiple pages
- If FAQs are displayed via layout (like FaqContainer), only add structured data on `/faq` page
- Page-specific FAQs can have their own structured data

## Google Rich Results

When properly implemented, your FAQs may appear in Google Search as:

```
Your Page Title
https://odysway.com/...
★★★★★ (if you have reviews)

▼ Question 1?
  Answer text preview...

▼ Question 2?
  Answer text preview...

▼ Question 3?
  More questions available
```

## Testing

### 1. Google Rich Results Test
```
https://search.google.com/test/rich-results
```
Enter your page URL to see if FAQ schema is valid.

### 2. View in Browser
Open DevTools → Elements → `<head>` → Look for:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [...]
}
</script>
```

### 3. Check Structured Data
```javascript
// In browser console
const scripts = document.querySelectorAll('script[type="application/ld+json"]')
scripts.forEach(s => console.log(JSON.parse(s.textContent)))
```

## Examples of Good FAQs for SEO

### Travel/Voyage Pages

✅ **Good:**
```
Q: Quand est la meilleure période pour visiter le Japon ?
A: La meilleure période pour visiter le Japon dépend de vos préférences.
   Le printemps (mars-mai) offre les cerisiers en fleurs, l'automne
   (septembre-novembre) présente des températures agréables et des couleurs
   automnales magnifiques...

Q: Le voyage inclut-il l'assurance ?
A: Oui, tous nos voyages incluent une assurance multirisque de base...
```

❌ **Avoid:**
```
Q: Japon ?
A: Oui.

Q: Contactez-nous pour plus d'informations
A: [This isn't a question]
```

## Troubleshooting

### FAQ Schema Not Appearing

1. **Check if data is fetched:**
   ```javascript
   console.log(getFaqsForSchema.value)
   ```

2. **Verify Portable Text conversion:**
   ```javascript
   import { portableTextToPlain } from '~/utils/portableTextToPlain'
   console.log(portableTextToPlain(yourAnswer))
   ```

3. **Check schema generation:**
   ```javascript
   console.log(createFAQPageSchema(getFaqsForSchema.value))
   ```

### Empty Answers

If answers are empty, check:
- Answer field in Sanity is not empty
- Portable Text is properly formatted
- `portableTextToPlain` is handling all block types

## Migration Checklist

- [x] FAQ page - Full FAQ schema implementation
- [ ] Homepage - Optional limited FAQ schema
- [ ] Voyage pages - Add voyage-specific FAQ schema
- [ ] Other pages with FAQ sections

## Resources

- [Google FAQ Rich Results Docs](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [Schema.org FAQPage Spec](https://schema.org/FAQPage)
- [Portable Text Specification](https://www.sanity.io/docs/presenting-block-text)

