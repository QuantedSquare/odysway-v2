# Sanity SSR Guide for Nuxt 3

This guide explains how to properly implement Server-Side Rendering (SSR) with Sanity CMS in your Nuxt 3 application.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [GROQ Query Best Practices](#groq-query-best-practices)
3. [useAsyncData Configuration](#useasyncdata-configuration)
4. [Image Handling](#image-handling)
5. [SEO & Meta Tags](#seo--meta-tags)
6. [Error Handling](#error-handling)
7. [Performance Optimization](#performance-optimization)

## Core Concepts

### What is SSR?

Server-Side Rendering (SSR) means your page is rendered on the server before being sent to the client. This provides:

- **Better SEO**: Search engines can crawl fully rendered content
- **Faster initial page load**: Users see content immediately
- **Social media previews**: OG tags work correctly for sharing

### How Nuxt 3 Handles SSR

```javascript
// ❌ BAD - Data fetches on client only
const data = ref(null)
onMounted(async () => {
  data.value = await fetch('/api/data')
})

// ✅ GOOD - Data fetches on server AND client
const { data } = await useAsyncData('key', () => $fetch('/api/data'))
```

## GROQ Query Best Practices

### 1. Always Expand Image Asset References

Images in Portable Text are stored as references. You must expand them to get the URL:

```groq
// ❌ BAD - Image won't have URL
body[]{
  ...
}

// ✅ GOOD - Image asset is expanded
body[]{
  ...,
  _type == "image" => {
    ...,
    asset->{
      _id,
      url,
      metadata {
        lqip,
        dimensions
      }
    }
  }
}
```

### 2. Select Only What You Need

Don't fetch everything - specify the fields you need:

```groq
// ❌ BAD - Fetches everything
*[_type == "blog"][0]{
  ...
}

// ✅ GOOD - Specific fields only
*[_type == "blog"][0]{
  _id,
  title,
  slug,
  excerpt,
  body[]{
    ...,
    _type == "image" => {
      ...,
      asset->{ url }
    }
  }
}
```

### 3. Expand References Properly

Use `->` to follow references:

```groq
*[_type == "post"][0]{
  title,
  author->{      // Expands author reference
    name,
    image
  },
  categories[]-> {  // Expands array of category references
    title,
    slug
  }
}
```

## useAsyncData Configuration

### Basic Setup

```javascript
const { data, error, pending, refresh } = await useAsyncData(
  'unique-key',           // 1. Unique key for caching
  async () => {           // 2. Async function to fetch data
    const { data } = await useSanityQuery(query, params)
    return data.value
  },
  {
    watch: [slug],        // 3. Reactive dependencies
    server: true,         // 4. Enable SSR
    getCachedData: (key) => { // 5. Client-side cache reuse
      return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
    },
  }
)
```

### Key Configuration Options

#### 1. Unique Key with Dynamic Values

```javascript
// ✅ GOOD - Unique key per slug
await useAsyncData(`category-${slug.value}`, ...)

// ❌ BAD - Same key for all pages (caching issues)
await useAsyncData('category', ...)
```

#### 2. Watch for Reactive Updates

```javascript
const slug = computed(() => route.params.slug)

await useAsyncData(
  `data-${slug.value}`,
  async () => { /* fetch */ },
  {
    watch: [slug], // Re-fetch when slug changes
  }
)
```

#### 3. Server-Side Rendering

```javascript
{
  server: true,  // Fetch on server (SSR)
  lazy: false,   // Don't wait for client hydration
}
```

#### 4. Data Caching

```javascript
{
  getCachedData: (key) => {
    // Reuse server-rendered data on client navigation
    return useNuxtApp().payload.data[key] || useNuxtApp().static.data[key]
  },
}
```

## Image Handling

### 1. Sanity Image URLs

After expanding asset references, use the URL directly:

```vue
<template>
  <ImageContainer
    :imageSrc="blog.mainImage?.asset?.url"
    :alt="blog.mainImage?.alt"
  />
</template>
```

### 2. Portable Text Images

The `EnrichedText` component handles images automatically:

```vue
<template>
  <EnrichedText :value="blog.body" />
</template>
```

## SEO & Meta Tags

### 1. Reactive Meta Tags

Use `watchEffect` to update meta tags when data changes:

```javascript
watchEffect(() => {
  if (!data.value) return

  useSeoMeta({
    title: data.value.seo?.title || data.value.title,
    description: data.value.seo?.description,
    ogImage: data.value.mainImage?.asset?.url,
    ogType: 'article',
  })
})
```

### 2. Structured Data (JSON-LD)

```javascript
useSchemaOrg([
  computed(() => {
    if (!blog.value) return null

    return {
      '@type': 'Article',
      'headline': blog.value.title,
      'datePublished': blog.value.publishedAt,
      'author': {
        '@type': 'Person',
        'name': blog.value.author.name,
      },
    }
  }),
])
```

## Error Handling

### 1. Display Loading States

```vue
<template>
  <v-container v-if="pending">
    <v-progress-circular indeterminate />
  </v-container>

  <v-container v-else-if="error">
    <h2>Error: {{ error.message }}</h2>
  </v-container>

  <div v-else-if="data">
    <!-- Content -->
  </div>
</template>
```

### 2. Handle 404s on Server

```javascript
// Throw 404 error during SSR if content not found
if (import.meta.server && !pending.value && !data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  })
}
```

## Performance Optimization

### 1. Parallel Queries

Fetch multiple queries in parallel when possible:

```javascript
// ✅ GOOD - Parallel fetching
const [{ data: category }, { data: voyages }] = await Promise.all([
  useAsyncData('category', () => ...),
  useAsyncData('voyages', () => ...),
])

// ❌ BAD - Sequential fetching
const { data: category } = await useAsyncData('category', () => ...)
const { data: voyages } = await useAsyncData('voyages', () => ...)
```

### 2. Lazy Loading

For non-critical data, use lazy loading:

```javascript
const { data } = await useAsyncData(
  'key',
  () => fetch(),
  {
    lazy: true,  // Don't block page render
  }
)
```

### 3. Data Deduplication

Nuxt automatically deduplicates requests with the same key:

```javascript
// Multiple components calling this will only fetch once
await useAsyncData('global-settings', () => fetchSettings())
```

## Complete Example

See `/pages/thematiques/[thematiqueSlug].vue` for a complete working example with:

- ✅ Proper GROQ queries with image expansion
- ✅ SSR-enabled data fetching
- ✅ Reactive slug updates
- ✅ Loading and error states
- ✅ SEO meta tags
- ✅ Structured data
- ✅ 404 handling

## Composable Pattern

For reusable queries, create composables:

```javascript
// composables/useSanityCategory.js
export function useSanityCategory(slug) {
  return useAsyncData(
    `category-${unref(slug)}`,
    async () => {
      const { data } = await useSanityQuery(query, { slug: unref(slug) })
      return data.value
    },
    {
      watch: [slug],
      server: true,
    }
  )
}

// In your page
const { category, error, pending } = useSanityCategory(slug)
```

## Debugging Tips

### 1. Check Server vs Client Rendering

```javascript
console.log('Is server?', import.meta.server)
console.log('Is client?', import.meta.client)
```

### 2. Inspect Payload

```javascript
// See what data was sent from server
console.log('Payload:', useNuxtApp().payload.data)
```

### 3. Monitor GROQ Queries

Add logging to your queries:

```javascript
const { data } = await useSanityQuery(query, params)
console.log('GROQ Result:', data.value)
```

## Common Mistakes to Avoid

1. ❌ Not expanding image asset references in GROQ
2. ❌ Using reactive values without `unref()` or `.value`
3. ❌ Forgetting to watch reactive dependencies
4. ❌ Same cache key for different data
5. ❌ Fetching on `onMounted` instead of `useAsyncData`
6. ❌ Not handling loading and error states
7. ❌ Using `process.server` instead of `import.meta.server`

## Resources

- [Nuxt 3 Data Fetching](https://nuxt.com/docs/getting-started/data-fetching)
- [Sanity GROQ](https://www.sanity.io/docs/groq)
- [Nuxt SEO](https://nuxtseo.com/)
