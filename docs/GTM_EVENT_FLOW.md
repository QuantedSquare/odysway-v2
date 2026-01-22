# GTM Event Flow Diagram

Visual representation of how GTM events flow through the application.

## Page Load Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User navigates to page                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. analytics.client.ts plugin executes                      │
│    - Initializes window.dataLayer                           │
│    - Detects page type from URL                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Push preload_data event                                  │
│    dataLayer.push({                                         │
│      event: 'preload_data',                                 │
│      page_type: 'Homepage'                                  │
│    })                                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. GTM container loads and processes preload_data          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. GTM fires page_view event (handled by GTM internally)   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Page components mount and fire interaction events        │
└─────────────────────────────────────────────────────────────┘
```

## Homepage Event Flow

```
Homepage Load
     │
     ├─► preload_data (page_type: 'Homepage')
     │
     └─► Components mount in order:
         │
         ├─► ExperienceCarousel
         │   └─► view_promotion ('Expériences à vivre')
         │
         ├─► TrackableVoyageList (France Trips)
         │   └─► [Scrolled into view]
         │       └─► view_item_list (voyages array)
         │
         ├─► TrackableVoyageList (Guaranteed Departures)
         │   └─► [Scrolled into view]
         │       └─► view_item_list (voyages array)
         │
         ├─► TrackableVoyageList (Summer Travel)
         │   └─► [Scrolled into view]
         │       └─► view_item_list (voyages array)
         │
         └─► TrackableVoyageList (Unforgettable Travels)
             └─► [Scrolled into view]
                 └─► view_item_list (voyages array)

User Interactions:
     │
     ├─► Clicks experience card
     │   └─► select_promotion (card name, promotion name)
     │
     ├─► Clicks slider arrow
     │   └─► clic_nav_slider
     │
     ├─► Clicks voyage card
     │   └─► select_item (voyage data, list name)
     │
     ├─► Clicks "Prendre RDV"
     │   └─► clic_rdv + clic_cta
     │
     ├─► Clicks "Prochains départs"
     │   └─► clic_cta
     │
     └─► Subscribes to newsletter
         └─► newsletter (email)
```

## Component Tracking Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     useGtmTracking()                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Central composable for all GTM events                  │  │
│  │ - Handles dataLayer.push()                             │  │
│  │ - Provides tracking functions                          │  │
│  │ - Logs events to console                               │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────┘
                            │
                            │ Used by
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Components  │  │    Plugins    │  │     Pages     │
└───────────────┘  └───────────────┘  └───────────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────────────────────────────────────────────┐
│              window.dataLayer                        │
│  ┌────────────────────────────────────────────────┐  │
│  │ [                                              │  │
│  │   { event: 'preload_data', page_type: '...' },│  │
│  │   { event: 'view_promotion', ... },           │  │
│  │   { event: 'select_item', ... },              │  │
│  │   ...                                          │  │
│  │ ]                                              │  │
│  └────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────┘
                         │
                         │ Processed by
                         │
                         ▼
               ┌──────────────────┐
               │  GTM Container   │
               │  (GTM-NP63ZR5)   │
               └────────┬─────────┘
                        │
                        │ Sends to
                        │
                        ▼
               ┌──────────────────┐
               │  Google Analytics│
               │      (GA4)       │
               └──────────────────┘
```

## Voyage Card Click Flow

```
User clicks voyage card
        │
        ▼
┌────────────────────────────────────────┐
│ VoyageCard.vue / NextDepartureCard.vue │
│ @click="handleCardClick"               │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ formatVoyageForGtm(voyage)             │
│ Transforms voyage data to GTM format   │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ trackSelectItem({                      │
│   currency: 'EUR',                     │
│   item: formattedVoyage,               │
│   itemListName: 'Section Title'        │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ dataLayer.push({                       │
│   event: 'select_item',                │
│   ecommerce: {                         │
│     currency: 'EUR',                   │
│     items: [{ ...voyage data }]        │
│   }                                    │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ GTM processes event → GA4              │
└────────────────────────────────────────┘
```

## TrackableVoyageList Flow

```
TrackableVoyageList component mounts
        │
        ▼
┌────────────────────────────────────────┐
│ Creates Intersection Observer          │
│ Observes list container                │
└───────────┬────────────────────────────┘
            │
            │ User scrolls...
            │
            ▼
┌────────────────────────────────────────┐
│ List becomes 10% visible               │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ formatVoyagesForGtm(voyages)           │
│ Formats all voyages in list            │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ trackViewItemList({                    │
│   currency: 'EUR',                     │
│   items: formattedVoyages,             │
│   itemListName: listName               │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ dataLayer.push({                       │
│   event: 'view_item_list',             │
│   ecommerce: { ... }                   │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ Mark as tracked (hasTracked = true)   │
│ Disconnect observer                    │
└────────────────────────────────────────┘
```

## CTA Button Click Flow

```
User clicks CTA button
        │
        ▼
┌────────────────────────────────────────┐
│ ctaButton.vue                          │
│ @click="handleClick"                   │
└───────────┬────────────────────────────┘
            │
            ├─► If link contains 'calendly' or 'rdv'
            │   └─► trackRdvClick()
            │
            ├─► If ctaId/ctaLabel provided
            │   └─► trackCtaClick({
            │         ctaId, ctaLabel, ctaUrl
            │       })
            │
            ├─► Legacy tracking
            │   ├─► trackPixel('trackCustom', 'ClickRDV')
            │   └─► captureOutboundLink(link)
            │
            └─► navigateTo(link)
```

## Newsletter Subscription Flow

```
User enters email and clicks subscribe
        │
        ▼
┌────────────────────────────────────────┐
│ NewsletterContainer.vue                │
│ subscribeToNewsletter()                │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ Validate email with Zod                │
└───────────┬────────────────────────────┘
            │ Valid
            ▼
┌────────────────────────────────────────┐
│ apiRequest('/brevo/optin', ...)        │
│ Send to Brevo API                      │
└───────────┬────────────────────────────┘
            │ Success
            ▼
┌────────────────────────────────────────┐
│ trackNewsletterSubscription(email)     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ dataLayer.push({                       │
│   event: 'newsletter',                 │
│   user_data: {                         │
│     user_mail: email                   │
│   }                                    │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ Show success message                   │
└────────────────────────────────────────┘
```

## SPA Navigation Flow

```
User clicks internal link
        │
        ▼
┌────────────────────────────────────────┐
│ Vue Router processes navigation        │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ router.afterEach((to, from) => {       │
│   if (to.path !== from.path)          │
│     trackPageView(to)                  │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ getPageType(route)                     │
│ Determine page type from URL           │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ trackPreloadData(pageType)             │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ dataLayer.push({                       │
│   event: 'preload_data',               │
│   page_type: pageType                  │
│ })                                     │
└───────────┬────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────┐
│ GTM fires page_view automatically      │
└────────────────────────────────────────┘
```

## Data Flow Summary

```
User Action → Component Handler → useGtmTracking() → dataLayer → GTM → GA4

Example:
Click Card → handleCardClick() → trackSelectItem() → window.dataLayer → GTM Container → Google Analytics
```
