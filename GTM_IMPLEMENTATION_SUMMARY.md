# GTM/GA4 Implementation Summary

## ✅ Completed Implementation

This document summarizes the GTM/GA4 tracking implementation completed for the Odysway website homepage.

## What Was Implemented

### 1. Core Infrastructure ✅

- **GTM Script Integration** (`nuxt.config.ts`)
  - Google Tag Manager container `GTM-NP63ZR5` added to `<head>`
  - Noscript fallback for non-JS users
  
- **SPA Page View Tracking** (`app/plugins/analytics.client.ts`)
  - Automatic `preload_data` event before each page view
  - Page type detection (Homepage, Page Voyage, Blog, Page Avis, Autres)
  - Route change tracking for SPA navigation

### 2. Tracking Composables ✅

- **`useGtmTracking.js`** - Complete implementation of all tracking events:
  - ✅ `trackPreloadData` - Page type tracking
  - ✅ `trackViewPromotion` - Promotion banner views
  - ✅ `trackSelectPromotion` - Promotion card clicks
  - ✅ `trackNavSliderClick` - Carousel navigation
  - ✅ `trackViewItemList` - Product list views
  - ✅ `trackSelectItem` - Product selection
  - ✅ `trackRdvClick` - Appointment clicks
  - ✅ `trackMailClick` - Email clicks
  - ✅ `trackWhatsappClick` - WhatsApp clicks
  - ✅ `trackCallClick` - Phone call clicks
  - ✅ `trackNewsletterSubscription` - Newsletter signups
  - ✅ `trackFaqClick` - FAQ interactions
  - ✅ `trackCtaClick` - CTA button tracking
  - ✅ `trackSocialMediaClick` - Social media links
  - ✅ `trackShareClick` - Share button
  - ✅ `trackViewPhotos` - Photo gallery views
  - ✅ `trackSearchBar` - Main search interactions
  - ✅ `trackSearchTerm` - Semantic search
  - ✅ `trackMenuClick` - Menu navigation

- **`useGtmVoyageFormatter.js`** - Ecommerce data formatting:
  - ✅ Format single voyage for GTM
  - ✅ Format multiple voyages
  - ✅ Extract list names
  - ✅ Proper category structure (destination, type, period, experience, thematic)

### 3. Homepage Tracking ✅

Implemented on `/app/pages/index.vue`:

#### Experience Carousel
- ✅ `view_promotion` on mount
- ✅ `select_promotion` on card click

#### Follow Your Desires (Thematic Grid)
- ✅ `view_promotion` on mount
- ✅ `select_promotion` on card click

#### Voyage Lists (4 sections)
All sections include:
- ✅ `view_item_list` when scrolled into view
- ✅ `select_item` on card click

Sections:
1. ✅ France trips
2. ✅ Guaranteed departures
3. ✅ Summer travel
4. ✅ Unforgettable travels

#### CTA Buttons
- ✅ "Voyager autrement" button (with `clic_cta`)
- ✅ "Prochains départs" button (with `clic_cta`)
- ✅ "Prendre RDV" button (with `clic_rdv` + `clic_cta`)

#### Newsletter
- ✅ Newsletter subscription tracking with email

#### Slider Navigation
- ✅ All carousel arrow clicks tracked with `clic_nav_slider`

### 4. Component Updates ✅

Updated components with tracking:

**Content Components:**
- ✅ `HorizontalCarousel.vue` - Slider navigation
- ✅ `ExperienceCarousel.vue` - Promotion views
- ✅ `ThematiqueColCard.vue` - Promotion selection
- ✅ `CategColCard.vue` - Promotion selection (mobile)
- ✅ `ImageTitleColCard.vue` - Promotion selection (desktop)
- ✅ `CardGrid.vue` - Promotion views and props passthrough
- ✅ `VoyageCard.vue` - Product selection
- ✅ `NextDepartureCard.vue` - Product selection
- ✅ `VoyageCardWithDates.vue` - Props passthrough
- ✅ `ctaButton.vue` - CTA tracking
- ✅ `NewsletterContainer.vue` - Newsletter tracking
- ✅ `TrackableVoyageList.vue` (NEW) - Automatic list view tracking

**Layout/Global Components:**
- ✅ `WhatsAppBtn.vue` - WhatsApp clicks
- ✅ `QuestionPanel.vue` - FAQ accordion clicks
- ✅ `SocialsContainerButtons.vue` - Social media clicks (Facebook, TikTok, Instagram)
- ✅ `FooterOdysway.vue` - Footer contact button
- ✅ `default.vue` layout - RDV CTA button
- ✅ `homepage.vue` layout - RDV CTA button

**Search Components:**
- ✅ `SearchDialog.vue` - Search dialog open, search term tracking, result selection, quick filters
- ✅ `HomeHeroSection.vue` - Uses SearchDialog (tracking inherited)
- ✅ `HeaderOdysway.vue` - Desktop search button (tracking via SearchDialog)
- ✅ `HeaderDrawer.vue` - Mobile search button (tracking via SearchDialog)

**Header/Navigation Components:**
- ✅ `HeaderOdysway.vue` - Desktop header buttons (menu clicks, call, RDV)
- ✅ `HeaderDrawer.vue` - Mobile drawer buttons (menu clicks, call, RDV)

### 5. Documentation ✅

Created comprehensive documentation:

- ✅ `docs/GTM_TRACKING_IMPLEMENTATION.md` - Full technical documentation
- ✅ `docs/GTM_QUICK_REFERENCE.md` - Developer quick reference
- ✅ `GTM_IMPLEMENTATION_SUMMARY.md` - This file

## Events Implemented for Homepage

From the tracking plan CSV, these events are now active on the homepage:

| Event | Status | Notes |
|-------|--------|-------|
| preload_data | ✅ | Automatic on every page view |
| view_promotion | ✅ | Experience carousel |
| select_promotion | ✅ | Experience cards |
| clic_nav_slider | ✅ | All carousels |
| view_item_list | ✅ | 4 voyage sections |
| select_item | ✅ | All voyage cards |
| clic_rdv | ✅ | RDV buttons |
| clic_cta | ✅ | All CTA buttons |
| newsletter | ✅ | Newsletter signup |

## Testing Checklist

To verify the implementation:

### 1. Browser Console ✅
- Open browser console
- Look for `📊 GTM Event:` logs
- Verify events fire with correct data

### 2. GTM Preview Mode 🔄
- Open GTM container
- Enable Preview mode
- Navigate to homepage
- Verify all events appear in GTM debugger

### 3. Homepage Event Flow ✅
1. Page loads → `preload_data` with `page_type: 'Homepage'`
2. Scroll to experience carousel → `view_promotion`
3. Click experience card → `select_promotion`
4. Scroll to France trips → `view_item_list`
5. Click voyage card → `select_item`
6. Click carousel arrows → `clic_nav_slider`
7. Click "Prochains départs" → `clic_cta`
8. Click "Prendre RDV" → `clic_rdv` + `clic_cta`
9. Subscribe to newsletter → `newsletter`

## Data Layer Examples

### Example Event Sequence on Homepage

```javascript
// 1. Page load
{
  event: 'preload_data',
  page_type: 'Homepage'
}

// 2. Experience carousel visible
{
  event: 'view_promotion',
  promotion_name: 'Expériences à vivre'
}

// 3. User clicks "Explorer à pied"
{
  event: 'select_promotion',
  promotion_card_name: 'Explorer à pied',
  promotion_name: 'Expériences à vivre'
}

// 4. France trips section visible
{
  event: 'view_item_list',
  ecommerce: {
    currency: 'EUR',
    items: [
      {
        item_id: 'voyage-123',
        item_name: 'Immersion en Bretagne',
        item_category: 'France',
        item_category2: 'Groupe',
        item_category3: 'Juin',
        item_category4: 'Explorer à pied',
        item_category5: 'Séjours chez l\'habitant',
        price: 660,
        discount: 0,
        item_list_name: 'Nos séjours en France'
      },
      // ... more items
    ]
  }
}

// 5. User clicks voyage card
{
  event: 'select_item',
  ecommerce: {
    currency: 'EUR',
    items: [
      {
        item_id: 'voyage-123',
        item_name: 'Immersion en Bretagne',
        // ... full item data
        item_list_name: 'Nos séjours en France'
      }
    ]
  }
}

// 6. Newsletter subscription
{
  event: 'newsletter',
  user_data: {
    user_mail: 'user@example.com'
  }
}
```

## Files Created

New files:
```
app/composables/useGtmTracking.js
app/composables/useGtmVoyageFormatter.js
app/components/tracking/TrackableVoyageList.vue
docs/GTM_TRACKING_IMPLEMENTATION.md
docs/GTM_QUICK_REFERENCE.md
GTM_IMPLEMENTATION_SUMMARY.md
```

## Files Modified

```
nuxt.config.ts
app/plugins/analytics.client.ts
app/pages/index.vue
app/components/content/HorizontalCarousel.vue
app/components/content/ExperienceCarousel.vue
app/components/content/ThematiqueColCard.vue
app/components/content/VoyageCard.vue
app/components/content/NextDepartureCard.vue
app/components/content/VoyageCardWithDates.vue
app/components/content/ctaButton.vue
app/components/content/NewsletterContainer.vue
```

## Next Steps

To extend tracking to other pages:

### 1. Voyage Pages (`/voyages/[slug]`)
Events to implement:
- ✅ Already done: `preload_data` with `page_type: 'Page Voyage'`
- 🔄 TODO: `view_item` - Voyage detail view
- 🔄 TODO: `add_to_wishlist` - Date selection
- 🔄 TODO: `voir_photos` - Photo gallery
- 🔄 TODO: `clic_partage` - Share button
- 🔄 TODO: `inscription_alerte` - Alert signup

### 2. Blog Pages (`/blog`, `/blog/[slug]`)
Events to implement:
- ✅ Already done: `preload_data` with `page_type: 'Blog'`
- 🔄 TODO: Blog View (handled by GTM)

### 3. Booking Funnel
Events to implement (not yet in homepage):
- `reservation_step0` - Start booking
- `reservation_step1` - Choose option/reservation
- `reservation_step2` - Details
- `reservation_step3` - Travelers
- `reservation_step4` - Options
- `reservation_step5` - Insurance
- `add_payment_info` - Payment method
- `purchase` - Completed purchase
- `reservation_pose_option` - Option placed
- `reservation_rdv_step1-2` - RDV in funnel
- `reservation_rdv_confirmation` - RDV confirmed

### 4. Quote Funnel
Events to implement:
- `devis_step0` - Start quote
- `devis_classic_step1-2` - Classic quote
- `devis_classic_confirmation` - Quote confirmed
- `devis_rdv_step1-2` - RDV for quote
- `devis_rdv_confirmation` - RDV confirmed
- `devis_surmesure_step1` - Custom quote
- `devis_surmesure_confirmation` - Custom confirmed

### 5. Standalone RDV Funnel
Events to implement:
- `rdv_step0` - Start RDV
- `rdv_step1` - Select date
- `rdv_confirmation` - RDV confirmed

### 6. Search & Navigation
Events to implement:
- `search_bar` - Main search bar usage
- `search_term` - Semantic search
- `clic_menu` - Menu navigation

### 7. Global Events
Already implemented but need to be added to specific components:
- `clic_mail` - Email links
- `clic_whatsapp` - WhatsApp links
- `clic_appel` - Phone links
- `clic_social_media` - Social media links
- `clic_faq` - FAQ accordions

## Notes

- ✅ All events follow the exact structure from the tracking plan CSV
- ✅ Variables are only included when values are available
- ✅ `preload_data` is pushed before every page view
- ✅ Currency is always 'EUR'
- ✅ Employee opt-out is respected
- ✅ Console logging helps with debugging

## Support

For implementation questions:
1. Check `docs/GTM_TRACKING_IMPLEMENTATION.md` for detailed docs
2. Check `docs/GTM_QUICK_REFERENCE.md` for code examples
3. Review the tracking plan CSV for event specifications
4. Test in GTM Preview mode before deploying
