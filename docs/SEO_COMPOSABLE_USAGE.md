# SEO Composable Usage Guide

This guide shows how to use the `useSeo()` composable and structured data utilities across different page types in the application.

## Overview

The `useSeo()` composable centralizes all SEO logic and handles:
- Multiple SEO field naming conventions (metaTitle, seoTitle, etc.)
- Automatic fallbacks for missing data
- Open Graph images with proper URL generation
- Robots meta tags (index/noindex, follow/nofollow)
- Keywords and focus keywords
- Canonical URLs
- Structured data (Schema.org)
- Breadcrumbs

## Basic Usage

```javascript
import { useSeo } from '~/composables/useSeo'
import { createOrganizationSchema, createWebSiteSchema } from '~/utils/structuredData'

useSeo({
  seoData: sanityData.seo,
  content: sanityData,
  pageType: 'website',
  slug: 'page-slug',
  baseUrl: '/page-path',
  structuredData: createOrganizationSchema(),
  breadcrumbs: [
    { name: 'Home', url: 'https://odysway.com' },
    { name: 'Page', url: 'https://odysway.com/page' }
  ]
})
```

## Page Type Examples

### 1. Homepage (`pages/index.vue`)

```vue
<script setup>
const sanity = useSanity()

const homeQuery = groq`
  *[_type == "homePage"][0]{
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
    },
    heroSection{ image }
  }
`

const { data: homeSanity } = await useAsyncData('home', () =>
  sanity.fetch(homeQuery)
)

if (homeSanity.value) {
  const defaultContent = {
    title: 'Odysway - Voyages en Petits Groupes et Expériences Authentiques',
    description: 'Découvrez nos voyages en petits groupes à travers le monde.',
    image: homeSanity.value.heroSection?.image,
  }

  useSeo({
    seoData: homeSanity.value.seo,
    content: defaultContent,
    pageType: 'website',
    slug: 'home',
    baseUrl: '/',
    structuredData: [
      createOrganizationSchema({
        description: homeSanity.value.seo?.metaDescription || defaultContent.description,
      }),
      createWebSiteSchema(),
    ],
  })
}
</script>
```

### 2. Voyage Pages (`pages/voyages/[voyageSlug].vue`)

```vue
<script setup>
const route = useRoute()
const sanity = useSanity()

const voyageQuery = groq`
  *[_type == "voyage" && slug.current == $slug][0]{
    ...,
    seoSection{
      metaTitle,
      ogTitle,
      ogDescription,
      ogImage{ asset->{ _ref }, alt },
      canonicalUrl,
      twitterTitle,
      twitterDescription,
      twitterImage{ asset->{ _ref } },
      twitterCard
    }
  }
`

const { data: voyage } = await useAsyncData('voyage', () =>
  sanity.fetch(voyageQuery, { slug: route.params.voyageSlug })
)

watchEffect(() => {
  if (!voyage.value) return

  useSeo({
    seoData: voyage.value.seoSection,
    content: voyage.value,
    pageType: 'website',
    slug: voyage.value.slug?.current,
    baseUrl: `/voyages/${voyage.value.slug?.current}`,
    structuredData: createTouristTripSchema(
      voyage.value,
      `https://odysway.com/voyages/${voyage.value.slug?.current}`
    ),
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Voyages', url: 'https://odysway.com/voyages' },
      { name: voyage.value.title, url: `https://odysway.com/voyages/${voyage.value.slug?.current}` }
    ]
  })
})
</script>
```

### 3. Blog Posts (`pages/[blogSlug].vue`)

```vue
<script setup>
const route = useRoute()
const sanity = useSanity()

const blogQuery = groq`
  *[_type == "blog" && slug.current == $slug][0]{
    ...,
    seoTitle,
    seoDescription,
    displayedImg{ asset->{ _ref } },
    author->{ name, image, position },
    tags
  }
`

const { data: blogSanity } = await useAsyncData('blog', () =>
  sanity.fetch(blogQuery, { slug: route.params.blogSlug })
)

watchEffect(() => {
  if (!blogSanity.value) return

  useSeo({
    seoData: blogSanity.value, // Uses seoTitle, seoDescription naming
    content: blogSanity.value,
    pageType: 'article',
    slug: blogSanity.value.slug?.current,
    structuredData: createBlogPostingSchema(
      blogSanity.value,
      `https://odysway.com${route.path}`
    ),
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Blog', url: 'https://odysway.com/blog' },
      { name: blogSanity.value.title, url: `https://odysway.com${route.path}` }
    ]
  })
})
</script>
```

### 4. Destination Pages (with Blog Reference) (`pages/destinations/[destinationSlug].vue`)

```vue
<script setup>
const route = useRoute()
const sanity = useSanity()

const destinationQuery = groq`
  *[_type == "destination" && slug.current == $slug][0]{
    ...,
    blog->{
      ...,
      seoTitle,
      seoDescription,
      displayedImg{ asset->{ _ref } },
      author->{ name }
    }
  }
`

const { data: destinationSanity } = await useAsyncData('destination', () =>
  sanity.fetch(destinationQuery, { slug: route.params.destinationSlug })
)

if (destinationSanity.value) {
  // For destinations, experiences, and thematiques that reference a blog,
  // the SEO composable will automatically use the blog's SEO fields
  useSeo({
    seoData: {}, // Can be empty if no direct SEO fields
    content: destinationSanity.value, // The blog reference will be detected
    pageType: 'article',
    slug: destinationSanity.value.slug?.current,
    structuredData: destinationSanity.value.blog
      ? createBlogPostingSchema(
          destinationSanity.value.blog,
          `https://odysway.com/destinations/${destinationSanity.value.slug?.current}`
        )
      : null,
    breadcrumbs: [
      { name: 'Accueil', url: 'https://odysway.com' },
      { name: 'Destinations', url: 'https://odysway.com/destinations' },
      { name: destinationSanity.value.title, url: `https://odysway.com/destinations/${destinationSanity.value.slug?.current}` }
    ]
  })
}
</script>
```

### 5. Static Pages (`pages/vision-voyage-odysway.vue`)

```vue
<script setup>
const sanity = useSanity()

const visionPageQuery = groq`
  *[_type == "page_vision"][0]{
    ...,
    pageSettings{
      title,
      description,
      seo{
        metaTitle,
        metaDescription,
        ogTitle,
        ogDescription,
        canonicalUrl,
        robotsIndex,
        robotsFollow
      }
    }
  }
`

const { data: visionPage } = await useAsyncData('vision-page', () =>
  sanity.fetch(visionPageQuery)
)

if (visionPage.value) {
  useSeo({
    seoData: visionPage.value.pageSettings?.seo,
    content: visionPage.value.pageSettings,
    pageType: 'website',
    slug: 'vision-voyage-odysway',
  })
}
</script>
```

### 6. Experience Pages (with Blog Reference) (`pages/experiences/[experienceSlug].vue`)

```vue
<script setup>
const route = useRoute()
const sanity = useSanity()

const experienceQuery = groq`
  *[_type == "experience" && slug.current == $slug][0]{
    ...,
    blog->{
      ...,
      seoTitle,
      seoDescription,
      displayedImg{ asset->{ _ref } }
    }
  }
`

const { data: selectedExperience } = await useAsyncData('selected-experience', () =>
  sanity.fetch(experienceQuery, { slug: route.params.experienceSlug })
)

if (selectedExperience.value) {
  useSeo({
    seoData: {},
    content: selectedExperience.value,
    pageType: 'article',
    slug: selectedExperience.value.slug?.current,
    structuredData: selectedExperience.value.blog
      ? createBlogPostingSchema(
          selectedExperience.value.blog,
          `https://odysway.com/experiences/${selectedExperience.value.slug?.current}`
        )
      : null,
  })
}
</script>
```

### 7. Thematique Pages (with Blog Reference) (`pages/thematiques/[thematiqueSlug].vue`)

```vue
<script setup>
const route = useRoute()
const sanity = useSanity()

const categoryQuery = groq`
  *[_type == "category" && slug.current == $slug][0]{
    ...,
    blog->{
      ...,
      seoTitle,
      seoDescription,
      displayedImg{ asset->{ _ref } }
    }
  }
`

const { data: categorySanity } = await useAsyncData('category-sanity', () =>
  sanity.fetch(categoryQuery, { slug: route.params.thematiqueSlug })
)

if (categorySanity.value) {
  useSeo({
    seoData: {},
    content: categorySanity.value,
    pageType: 'article',
    slug: categorySanity.value.slug?.current,
    structuredData: categorySanity.value.blog
      ? createBlogPostingSchema(
          categorySanity.value.blog,
          `https://odysway.com/thematiques/${categorySanity.value.slug?.current}`
        )
      : null,
  })
}
</script>
```

## GROQ Query Template for SEO Fields

When fetching data from Sanity, include the SEO fields in your query:

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
      asset->{
        _ref,
        _id,
        url
      },
      alt
    }
  }
}
```

## Available Structured Data Functions

From `~/utils/structuredData.js`:

1. **`createOrganizationSchema(options)`** - For homepage and company pages
2. **`createWebSiteSchema()`** - For homepage with search action
3. **`createBlogPostingSchema(blog, url)`** - For blog posts and blog-referenced pages
4. **`createTouristTripSchema(voyage, url)`** - For voyage pages
5. **`createBreadcrumbSchema(crumbs)`** - For breadcrumbs (or use the `breadcrumbs` option in useSeo)
6. **`createFAQPageSchema(faqs)`** - For FAQ pages

## Field Naming Support

The composable automatically handles different SEO field naming conventions:

| Standard (new) | Blog posts | Voyage pages | Output |
|----------------|------------|--------------|--------|
| metaTitle | seoTitle | seoSection.metaTitle | title meta tag |
| metaDescription | seoDescription | seoSection.ogDescription | description meta tag |
| ogTitle | seoTitle | seoSection.ogTitle | og:title |
| ogDescription | seoDescription | seoSection.ogDescription | og:description |
| ogImage | displayedImg | seoSection.ogImage | og:image |

## Benefits

1. **Centralized SEO logic** - All SEO handling in one place
2. **Consistent implementation** - Same patterns across all pages
3. **Automatic fallbacks** - Missing SEO fields fall back to content fields
4. **Flexible naming** - Works with different Sanity schema naming conventions
5. **Type safety** - Clear API with documented options
6. **Easy maintenance** - Update SEO logic once, affects all pages
7. **Blog-referenced SEO** - Automatically uses blog SEO for destination/experience/thematique pages

## Migration Checklist

To migrate an existing page to use the SEO composable:

- [ ] Add SEO fields to your GROQ query (if not already present)
- [ ] Import `useSeo` and relevant structured data functions
- [ ] Replace existing `useSeoMeta()` and `useHead()` calls with `useSeo()`
- [ ] Pass the appropriate options (seoData, content, pageType, etc.)
- [ ] Add structured data using the helper functions
- [ ] Test the page to ensure meta tags are correct
- [ ] Remove old SEO code

