# GTM/GA4 Tracking Implementation

This document describes the Google Tag Manager (GTM) and Google Analytics 4 (GA4) tracking implementation for the Odysway website.

## Overview

The implementation follows the tracking plan provided in `Odywsway - Plan Tracking - dataLayer - Events.csv` and includes:

1. GTM script injection in the Nuxt config
2. Plugin for SPA page view tracking with `preload_data` event
3. Composables for managing GTM dataLayer events
4. Component-level tracking for user interactions

## Architecture

### 1. GTM Script Injection

**File**: `nuxt.config.ts`

The GTM script is injected in the `<head>` section with ID `GTM-NP63ZR5`. The noscript fallback is also included.

```javascript
app: {
  head: {
    script: [
      {
        id: 'gtm-script',
        innerHTML: `(function(w,d,s,l,i){...})(...,'GTM-NP63ZR5');`,
      },
    ],
    noscript: [
      {
        id: 'gtm-noscript',
        tagPosition: 'bodyOpen',
        innerHTML: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NP63ZR5"...></iframe>',
      },
    ],
  },
}
```

### 2. Analytics Plugin

**File**: `app/plugins/analytics.client.ts`

This plugin handles:
- DataLayer initialization
- Page view tracking for SPA navigation
- Automatic `preload_data` event before page views
- Page type detection based on route

**Page Types**:
- `Homepage`: `/`
- `Page Voyage`: `/voyages/[slug]`
- `Blog`: `/blog` or `/blog/[slug]`
- `Page Avis`: `/avis-voyageurs`
- `Autres`: All other pages

**Key Features**:
- Tracks initial page load on `app:mounted`
- Tracks route changes via `router.afterEach`
- Only tracks when path changes (not query/hash)
- **Important**: Pushes `page_type` WITHOUT an `event` key - GTM handles the `page_view` event automatically

### 3. GTM Tracking Composable

**File**: `app/composables/useGtmTracking.js`

Central composable for all GTM dataLayer events. 

**Important Feature**: Automatically cleans Sanity Stega encoding from all strings using `stegaClean()`. This prevents invisible Unicode characters from breaking Google Analytics tracking.

Includes functions for:

#### General Events
- `trackPreloadData(pageType)` - Must be called before page_view
- `trackNavSliderClick()` - Slider navigation arrows
- `trackMenuClick({ niv1, niv2, niv3 })` - Menu navigation

#### Promotion Events
- `trackViewPromotion(promotionName)` - When promotion banner is viewed
- `trackSelectPromotion(promotionCardName, promotionName)` - When promotion card is clicked

#### Ecommerce Events
- `trackViewItemList({ currency, items, itemListName })` - When product list is viewed
- `trackSelectItem({ currency, item, itemListName })` - When product is selected

#### User Interaction Events
- `trackRdvClick()` - Appointment button click
- `trackMailClick()` - Email link click
- `trackWhatsappClick()` - WhatsApp link click
- `trackCallClick()` - Phone call click
- `trackNewsletterSubscription(userMail)` - Newsletter signup
- `trackFaqClick(question)` - FAQ accordion click
- `trackCtaClick({ ctaId, ctaLabel, ctaUrl })` - CTA button click
- `trackSocialMediaClick(socialMedia)` - Social media link click
- `trackShareClick()` - Share button click
- `trackViewPhotos()` - Photo gallery view

#### Search Events
- `trackSearchBar({ destination, typeVoyage, periode, voyageGaranti })` - Main search bar
- `trackSearchTerm(searchTerm)` - Semantic search

### 4. Voyage Formatter Composable

**File**: `app/composables/useGtmVoyageFormatter.js`

Formats voyage data for ecommerce tracking with proper structure:

```javascript
{
  itemId: 'voyage-id',
  itemName: 'Voyage Title',
  itemCategory: 'Destination',      // Country/Region
  itemCategory2: 'Groupe/Individuel',
  itemCategory3: 'Period',           // Month or season
  itemCategory4: 'Experience',       // Type of experience
  itemCategory5: 'Thematic',         // Thematic category
  price: 660,
  discount: 10,
}
```

### 5. Component Tracking

#### a. TrackableVoyageList Component

**File**: `app/components/tracking/TrackableVoyageList.vue`

Wrapper component that tracks `view_item_list` event when voyage lists become visible using Intersection Observer.

**Usage**:
```vue
<TrackableVoyageList
  :voyages="voyageArray"
  :list-name="'Section Title'"
>
  <!-- Your list content -->
</TrackableVoyageList>
```

#### b. HorizontalCarousel

**File**: `app/components/content/HorizontalCarousel.vue`

Tracks `clic_nav_slider` event when users click navigation arrows.

#### c. ExperienceCarousel

**File**: `app/components/content/ExperienceCarousel.vue`

Tracks `view_promotion` event when the experience carousel is mounted.

#### d. ThematiqueColCard

**File**: `app/components/content/ThematiqueColCard.vue`

Tracks `select_promotion` event when promotion cards are clicked.

**Props**:
- `promotionName`: Name of the promotion banner

#### e. VoyageCard & NextDepartureCard

**Files**: 
- `app/components/content/VoyageCard.vue`
- `app/components/content/NextDepartureCard.vue`

Track `select_item` event when voyage cards are clicked.

**Props**:
- `itemListName`: Name of the list for ecommerce tracking

#### f. VoyageCardWithDates

**File**: `app/components/content/VoyageCardWithDates.vue`

Wrapper that passes `itemListName` to card components.

#### g. CtaButton

**File**: `app/components/content/ctaButton.vue`

Tracks:
- `clic_rdv` when link contains 'calendly' or 'rdv'
- `clic_cta` for all CTA button clicks

**Props**:
- `ctaId`: Unique identifier for the CTA
- `ctaLabel`: Button text
- `link`: Destination URL

#### h. NewsletterContainer

**File**: `app/components/content/NewsletterContainer.vue`

Tracks `newsletter` event on successful subscription with user email.

## Homepage Implementation

The homepage (`app/pages/index.vue`) includes tracking for:

1. **Experience Carousel**: 
   - Promotion view on mount
   - Promotion selection on card click

2. **Voyage Lists** (4 sections):
   - France trips
   - Guaranteed departures
   - Summer travel
   - Unforgettable travels
   
   Each list tracks:
   - `view_item_list` when scrolled into view
   - `select_item` when card is clicked

3. **CTA Buttons**:
   - "Voyager autrement" (Travel differently)
   - "Prendre RDV" (Book appointment)
   - "Prochains départs" button

4. **Newsletter Subscription**:
   - Email capture and tracking

## Data Structure Examples

### preload_data (Page Type Push)
**Note**: This is NOT an event - it just sets the page_type variable. GTM automatically fires `page_view` based on this.

```javascript
{
  page_type: 'Homepage'
}
```

### view_item_list Event
```javascript
{
  event: 'view_item_list',
  ecommerce: {
    currency: 'EUR',
    items: [
      {
        item_id: 'item123',
        item_name: 'Immersion hivernale au cœur des Pyrénées',
        item_category: 'France',
        item_category2: 'Groupe',
        item_category3: 'Février',
        item_category4: 'Explorer à pied',
        item_category5: 'Séjours chez l\'habitant',
        price: 660,
        discount: 10,
        item_list_name: 'Nos séjours en France'
      }
    ]
  }
}
```

### select_item Event
```javascript
{
  event: 'select_item',
  ecommerce: {
    currency: 'EUR',
    items: [
      {
        item_id: 'item123',
        item_name: 'Immersion hivernale au cœur des Pyrénées',
        item_category: 'France',
        item_category2: 'Groupe',
        item_category3: 'Février',
        item_category4: 'Explorer à pied',
        item_category5: 'Séjours chez l\'habitant',
        price: 660,
        discount: 10,
        item_list_name: 'Nos séjours en France'
      }
    ]
  }
}
```

### newsletter Event
```javascript
{
  event: 'newsletter',
  user_data: {
    user_mail: 'user@example.com'
  }
}
```

## Testing

### Browser Console

You can monitor all GTM events in the browser console. Each event is logged with:
```
📊 GTM Event: event_name { event: 'event_name', ...data }
```

### GTM Preview Mode

1. Open GTM container
2. Click "Preview"
3. Enter your site URL
4. Navigate through the site and verify events fire correctly

### Browser Extension

Use "Google Tag Assistant" Chrome extension to verify:
- GTM container loads correctly
- Events fire in proper sequence
- DataLayer structure is correct

## Important Notes

### Sanity Stega Encoding

✅ **Automatic**: All strings are automatically cleaned of Sanity Stega encoding (invisible Unicode characters used for visual editing) before being pushed to dataLayer. This prevents errors like `ERR_ABORTED 411 (Length Required)` from Google Analytics.

The `cleanStegaData()` function recursively cleans:
- All string values
- Nested objects
- Arrays

### Event Firing Order

⚠️ **Critical**: All events must fire AFTER the `preload_data` event. The plugin handles this automatically for page views.

### Variable Availability

⚠️ **Rule**: If a variable value is not available (like user_data), do not declare the variable. The composables follow this pattern.

### Employee Opt-out

The analytics plugin checks for `odysway_employee_optout` cookie. If set to '1', no tracking is initialized.

## Extending the Implementation

### Adding New Events

1. Add function to `useGtmTracking.js`:
```javascript
const trackMyNewEvent = (param1, param2) => {
  pushToDataLayer({
    event: 'my_new_event',
    param1,
    param2,
  })
}
```

2. Export the function:
```javascript
return {
  // ... existing exports
  trackMyNewEvent,
}
```

3. Use in components:
```vue
<script setup>
const { trackMyNewEvent } = useGtmTracking()

const handleAction = () => {
  trackMyNewEvent('value1', 'value2')
}
</script>
```

### Adding Tracking to New Pages

1. Wrap voyage lists with `TrackableVoyageList`
2. Pass `itemListName` prop to voyage cards
3. Add `ctaId` and `ctaLabel` to CTA buttons
4. Use appropriate tracking functions from composable

## Files Modified/Created

### Created:
- `app/composables/useGtmTracking.js`
- `app/composables/useGtmVoyageFormatter.js`
- `app/components/tracking/TrackableVoyageList.vue`
- `docs/GTM_TRACKING_IMPLEMENTATION.md`

### Modified:
- `nuxt.config.ts` - Added GTM script
- `app/plugins/analytics.client.ts` - Added page view tracking
- `app/pages/index.vue` - Added tracking to homepage
- `app/components/content/HorizontalCarousel.vue` - Slider tracking
- `app/components/content/ExperienceCarousel.vue` - Promotion tracking
- `app/components/content/ThematiqueColCard.vue` - Promotion selection
- `app/components/content/VoyageCard.vue` - Item selection tracking
- `app/components/content/NextDepartureCard.vue` - Item selection tracking
- `app/components/content/VoyageCardWithDates.vue` - Pass tracking props
- `app/components/content/ctaButton.vue` - CTA tracking
- `app/components/content/NewsletterContainer.vue` - Newsletter tracking

## Next Steps

To implement tracking on other pages:
1. Review the tracking plan CSV for page-specific events
2. Follow the same patterns used on the homepage
3. Add booking funnel events (reservation_step0-5, etc.)
4. Add voyage page specific events (view_item, add_to_wishlist)
5. Test thoroughly in GTM preview mode

## Support

For questions or issues with the tracking implementation:
1. Check browser console for event logs
2. Verify in GTM Preview mode
3. Review this documentation
4. Check the tracking plan CSV for event specifications
