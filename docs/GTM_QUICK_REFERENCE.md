# GTM Tracking - Quick Reference

Quick reference guide for implementing GTM tracking in components.

## Common Patterns

### 1. Track a Button Click

```vue
<script setup>
const { trackCtaClick } = useGtmTracking()

const handleClick = () => {
  trackCtaClick({
    ctaId: 'unique-id',
    ctaLabel: 'Button Text',
    ctaUrl: '/destination',
  })
}
</script>

<template>
  <button @click="handleClick">Click Me</button>
</template>
```

### 2. Track Voyage List View

```vue
<template>
  <TrackableVoyageList
    :voyages="voyageArray"
    :list-name="'My Voyage Section'"
  >
    <VoyageCardWithDates
      v-for="voyage in voyages"
      :key="voyage._id"
      :voyage="voyage"
      :item-list-name="'My Voyage Section'"
    />
  </TrackableVoyageList>
</template>
```

### 3. Track Promotion View/Click

```vue
<script setup>
const { trackViewPromotion, trackSelectPromotion } = useGtmTracking()

onMounted(() => {
  trackViewPromotion('Banner Name')
})

const handleCardClick = (cardName) => {
  trackSelectPromotion(cardName, 'Banner Name')
}
</script>
```

### 4. Track Newsletter Subscription

```vue
<script setup>
const { trackNewsletterSubscription } = useGtmTracking()

const subscribe = async (email) => {
  await sendToBrevo(email)
  trackNewsletterSubscription(email)
}
</script>
```

### 5. Track RDV/Calendly Click

```vue
<script setup>
const { trackRdvClick } = useGtmTracking()

const handleRdvClick = () => {
  trackRdvClick()
  navigateTo('/calendly')
}
</script>
```

## All Available Tracking Functions

```javascript
const {
  // General
  trackPreloadData,           // (pageType)
  trackNavSliderClick,        // ()
  
  // Promotions
  trackViewPromotion,         // (promotionName)
  trackSelectPromotion,       // (cardName, promotionName)
  
  // Ecommerce
  trackViewItemList,          // ({ currency, items, itemListName })
  trackSelectItem,            // ({ currency, item, itemListName })
  
  // Contact
  trackRdvClick,              // ()
  trackMailClick,             // ()
  trackWhatsappClick,         // ()
  trackCallClick,             // ()
  
  // User Actions
  trackNewsletterSubscription, // (email)
  trackFaqClick,              // (question)
  trackCtaClick,              // ({ ctaId, ctaLabel, ctaUrl })
  trackSocialMediaClick,      // (socialMediaName)
  trackShareClick,            // ()
  trackViewPhotos,            // ()
  
  // Search
  trackSearchBar,             // ({ destination, typeVoyage, periode, voyageGaranti })
  trackSearchTerm,            // (searchTerm)
  
  // Menu
  trackMenuClick,             // ({ niv1, niv2, niv3 })
} = useGtmTracking()
```

## Voyage Data Formatting

```javascript
const { formatVoyageForGtm, formatVoyagesForGtm } = useGtmVoyageFormatter()

// Single voyage
const formattedVoyage = formatVoyageForGtm(voyage, { discount: 10 })

// Multiple voyages
const formattedVoyages = formatVoyagesForGtm(voyages)
```

## Component Props for Tracking

### VoyageCard / NextDepartureCard
```vue
<VoyageCard
  :voyage="voyage"
  :item-list-name="'Section Title'"
/>
```

### VoyageCardWithDates
```vue
<VoyageCardWithDates
  :voyage="voyage"
  :dates-by-slug="datesBySlug"
  :item-list-name="'Section Title'"
/>
```

### ThematiqueColCard
```vue
<ThematiqueColCard
  :slug="slug"
  :image="image"
  :title="title"
  promotion-name="Banner Name"
/>
```

### CtaButton
```vue
<CtaButton
  :link="'/destination'"
  cta-id="unique-id"
  :cta-label="'Button Text'"
/>
```

## Page Type Values

Use these values for `trackPreloadData(pageType)`:
- `'Homepage'` - Home page
- `'Page Voyage'` - Voyage detail pages
- `'Blog'` - Blog pages
- `'Page Avis'` - Reviews page
- `'Autres'` - All other pages

## Important Rules

1. ⚠️ **Always** push `preload_data` BEFORE any page view (handled automatically by plugin)
2. ⚠️ **Never** include variables with undefined/null values
3. ⚠️ **Always** use `'EUR'` as currency
4. ⚠️ Use unique `ctaId` for each CTA button
5. ⚠️ Track list view when it becomes visible (use TrackableVoyageList)
6. ✅ **Automatic**: Sanity Stega encoding is automatically cleaned from all strings

## Debugging

Check browser console for:
```
📊 GTM Event: event_name { ...data }
```

Or check dataLayer directly:
```javascript
console.log(window.dataLayer)
```
