# Dynamic Sanity Dataset Switching Guide

This guide explains how to dynamically switch between Sanity datasets in your Nuxt application without rebuilding.

## Overview

The solution uses a custom composable (`useSanityDataset`) that creates Sanity clients dynamically based on the currently selected dataset. This allows you to switch between `production`, `staging`, or any other dataset on-the-fly.

## Files Created

1. **`composables/useSanityDataset.js`** - Main composable for dataset management
2. **`components/DatasetSwitcher.vue`** - UI component with a button to switch datasets

## Usage in Your Pages/Components

### Basic Usage

```vue
<script setup>
// Instead of using the default useSanity()
const { dataset, fetch, setDataset } = useSanityDataset()

// Fetch data with the active dataset
const { data: voyages } = await useAsyncData(
  `voyages-${dataset.value}`, // Important: include dataset in key for proper caching
  () => fetch(`*[_type == "voyage"]{ _id, title, slug }`),
  {
    watch: [dataset], // Refetch when dataset changes
  }
)
</script>
```

### Example: Update an Existing Page

Here's how to update your `pages/test.vue` or any other page:

```vue
<template>
  <div>
    <!-- Add the dataset switcher button -->
    <DatasetSwitcher />
    
    <h1>Current Dataset: {{ dataset }}</h1>
    
    <!-- Your existing content -->
    <div v-if="voyages">
      <div v-for="voyage in voyages" :key="voyage._id">
        {{ voyage.title }}
      </div>
    </div>
  </div>
</template>

<script setup>
// Use the custom composable instead of useSanity()
const { dataset, fetch } = useSanityDataset()

// Fetch data - will automatically use the active dataset
const { data: voyages, refresh } = await useAsyncData(
  `voyages-${dataset.value}`,
  () => fetch(`*[_type == "voyage"]{ _id, title, slug }`),
  {
    watch: [dataset], // Auto-refetch when dataset changes
  }
)
</script>
```

### Advanced: Manual Client Usage

If you need direct access to the Sanity client:

```vue
<script setup>
const { sanityClient, dataset } = useSanityDataset()

// Use the client directly
const fetchCustomData = async () => {
  const result = await sanityClient.value.fetch(
    `*[_type == "voyage" && slug.current == $slug][0]`,
    { slug: 'my-voyage' }
  )
  return result
}
</script>
```

## Adding the Dataset Switcher to Your Layout

To make it available across your entire app, add it to your layout:

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <HeaderOdysway />
    
    <!-- Add dataset switcher (only in dev mode) -->
    <DatasetSwitcher v-if="isDevMode" />
    
    <slot />
    
    <FooterOdysway />
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const isDevMode = config.public.environment !== 'production'
</script>
```

## Server-Side API Routes

For server-side API routes, you can pass the dataset as a query parameter:

```javascript
// server/api/v1/voyages.get.js
import { createClient } from '@sanity/client'

export default eventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  
  // Allow dataset override via query parameter
  const dataset = query.dataset || config.public.sanity.dataset
  
  const sanityClient = createClient({
    projectId: config.public.sanity.projectId,
    dataset: dataset,
    apiVersion: config.public.sanity.apiVersion,
    useCdn: false,
  })
  
  const voyages = await sanityClient.fetch(`*[_type == "voyage"]`)
  return voyages
})
```

Then call it from the client:

```javascript
const dataset = 'staging'
const response = await $fetch(`/api/v1/voyages?dataset=${dataset}`)
```

## Environment Variables

Make sure you have access to both datasets in your Sanity project. The datasets should already exist in your Sanity project (you can create them in the Sanity Studio).

Common dataset names:
- `production` - Your live content
- `staging` - Testing content before going live
- `development` - Development content

## Important Notes

1. **Caching**: Always include the dataset name in your `useAsyncData` key to prevent cache conflicts
   ```javascript
   useAsyncData(`my-data-${dataset.value}`, ...)
   ```

2. **CDN**: The composable sets `useCdn: false` for instant updates. If you want better performance, you can enable it but updates will be slower.

3. **Authentication**: If your datasets require authentication, make sure to set the token in your environment variables:
   ```env
   SANITY_VIEWER_TOKEN=your-token-here
   ```

4. **Production Safety**: Consider hiding the dataset switcher in production or protecting it with authentication.

## Comparison with Default useSanity()

| Feature | useSanity() | useSanityDataset() |
|---------|-------------|-------------------|
| Dataset | Fixed at build time | Dynamic at runtime |
| Use Case | Production apps | Testing, development, content preview |
| Configuration | nuxt.config.ts | Runtime composable |
| Performance | Optimized with CDN | Slightly slower (CDN disabled by default) |

## Security Considerations

If deploying to production with this feature:

1. **Hide in Production**: Only show the dataset switcher to authenticated users or in development
   ```vue
   <DatasetSwitcher v-if="isDevelopment || isAdmin" />
   ```

2. **API Protection**: Validate dataset names in API routes to prevent unauthorized access
   ```javascript
   const allowedDatasets = ['production', 'staging']
   if (!allowedDatasets.includes(dataset)) {
     throw createError({ statusCode: 400, message: 'Invalid dataset' })
   }
   ```

3. **Environment Detection**: Use environment variables to control availability
   ```javascript
   const config = useRuntimeConfig()
   const canSwitchDataset = config.public.environment !== 'production'
   ```

