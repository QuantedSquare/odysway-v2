# Dataset Switcher - Quick Start

## 🎯 What is this?

A feature that allows you to **dynamically switch between Sanity datasets** (e.g., production, staging, development) without rebuilding your application. Perfect for testing content in different workspaces!

## 🚀 Quick Start

### 1. Try it on the Test Page

Visit `/test` in development mode and you'll see:
- A **Dataset Switcher** button showing the current dataset
- Click it to switch between Production, Staging, or Development
- Data automatically refetches when you switch

### 2. Add to Your Page

```vue
<template>
  <div>
    <!-- Add the switcher button -->
    <DatasetSwitcher />
    
    <!-- Your data will automatically use the selected dataset -->
    <div v-for="voyage in voyages" :key="voyage._id">
      {{ voyage.title }}
    </div>
  </div>
</template>

<script setup>
// Use the custom composable
const { dataset, fetch } = useSanityDataset()

// Fetch data - it will use the active dataset
const { data: voyages } = await useAsyncData(
  () => `voyages-${dataset.value}`, // Important: include dataset in key
  () => fetch(`*[_type == "voyage"]{ _id, title }`),
  {
    watch: [dataset], // Auto-refetch when dataset changes
  }
)
</script>
```

## 📦 What was Created?

1. **`composables/useSanityDataset.js`** - Core composable for dataset management
2. **`components/DatasetSwitcher.vue`** - UI button component
3. **`pages/test.vue`** - Updated with working example
4. **`docs/DATASET_SWITCHING_GUIDE.md`** - Detailed documentation

## 🔧 How it Works

### The Composable

```javascript
const { dataset, setDataset, fetch, sanityClient } = useSanityDataset()

// dataset - Current dataset name (reactive)
// setDataset('staging') - Change dataset
// fetch(query, params) - Fetch from current dataset
// sanityClient - Direct access to Sanity client
```

### State Management

The current dataset is stored in Nuxt's `useState`, so it persists across the app but resets on page refresh. This is intentional to avoid confusion - you always start with your configured default.

## 🎨 Customization

### Change Available Datasets

Edit `components/DatasetSwitcher.vue`:

```javascript
const datasetOptions = [
  { label: 'Production', value: 'production', color: 'success' },
  { label: 'Staging', value: 'staging', color: 'warning' },
  // Add more datasets here
]
```

### Add to Layout (Development Only)

```vue
<!-- layouts/default.vue -->
<template>
  <div>
    <DatasetSwitcher v-if="isDev" class="floating-switcher" />
    <!-- rest of layout -->
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const isDev = config.public.environment === 'development'
</script>

<style>
.floating-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}
</style>
```

## ⚠️ Important Notes

1. **Cache Keys**: Always include the dataset in your `useAsyncData` key:
   ```javascript
   useAsyncData(`my-data-${dataset.value}`, ...)
   ```

2. **Datasets Must Exist**: The datasets you want to switch to must exist in your Sanity project

3. **Development Only**: Consider hiding this feature in production or protecting it with auth

4. **CDN Disabled**: The custom client has CDN disabled by default for instant updates

## 🔐 Security for Production

If you want this in production (e.g., for admin preview):

```vue
<!-- Only show to authenticated admins -->
<DatasetSwitcher v-if="user?.role === 'admin'" />
```

Or use environment check:

```vue
<DatasetSwitcher v-if="isDevelopment || isPreview" />
```

## 📚 Next Steps

- Read the [full documentation](./DATASET_SWITCHING_GUIDE.md) for advanced usage
- Test it at `/test` page
- Add it to your layouts or specific pages as needed

## 💡 Use Cases

- ✅ Preview content before publishing to production
- ✅ Test new content structures in a staging dataset
- ✅ Compare content between environments
- ✅ Debug content issues across datasets
- ✅ Demo different content to clients

