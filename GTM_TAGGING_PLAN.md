# 🏷️ GTM Tagging Implementation Plan

**Project**: Odysway v2  
**Date Created**: 2026-01-22  
**Status**: Planning Phase  
**Reference**: `Odywsway - Plan Tracking - dataLayer - Events.csv`

---

## ⚠️ Important Notes

**SCOPE**: This plan implements **ONLY** the GTM/GA4 events defined in the CSV tracking plan.

**Existing Tracking**: 
- Facebook Pixel (`trackPixel()`) calls exist in some components
- These will be **removed later** in a separate cleanup phase
- **DO NOT duplicate** these events in GTM - they serve different purposes
- Focus exclusively on the events defined in the CSV

**What to implement**: Only the events from the CSV:
- `page_view`, `preload_data` ✅
- `view_promotion`, `select_promotion` ✅
- `view_item_list`, `select_item` ✅
- `view_item`, `add_to_wishlist`
- `reservation_step*`, `devis_*`, `rdv_*`
- `search_bar`, `search_term` ✅
- `clic_*` events ✅
- `newsletter` ✅
- Etc. (all from CSV)

---

## ✅ Already Implemented (Completed)

### 1. Core Infrastructure
- ✅ `app/composables/useGtmTracking.js` - Central tracking composable
- ✅ `app/composables/useGtmVoyageFormatter.js` - Voyage data formatter
- ✅ `app/plugins/analytics.client.ts` - Page view tracking plugin
- ✅ `nuxt.config.ts` - GTM script integration

### 2. Homepage (`app/pages/index.vue`)
- ✅ `preload_data` - Page type tracking
- ✅ `view_promotion` - Experience carousel, card grids
- ✅ `select_promotion` - Experience cards, category cards
- ✅ `view_item_list` - Voyage carousels (removed TrackableVoyageList per user)
- ✅ `select_item` - Voyage card clicks
- ✅ `clic_nav_slider` - Carousel navigation arrows
- ✅ `clic_cta` - All CTA buttons
- ✅ `clic_rdv` - RDV buttons
- ✅ `newsletter` - Newsletter subscription

### 3. Global Layout Components
- ✅ `WhatsAppBtn.vue` - `clic_whatsapp`
- ✅ `QuestionPanel.vue` - `clic_faq`
- ✅ `SocialsContainerButtons.vue` - `clic_social_media`
- ✅ `FooterOdysway.vue` - Footer contact button
- ✅ `HeaderOdysway.vue` - Desktop header buttons (`clic_menu`, `clic_appel`, `clic_rdv`)
- ✅ `HeaderDrawer.vue` - Mobile drawer buttons
- ✅ `default.vue` layout - RDV CTA button
- ✅ `homepage.vue` layout - RDV CTA button

### 4. Search & Discovery
- ✅ `SearchDialog.vue` - `search_term`, `select_item`, `clic_cta` (open dialog, quick filters)
- ✅ `HomeHeroSection.vue` - Uses SearchDialog (tracking inherited)

---

## 🔴 TODO: High Priority (Core User Journey)

### 1. Voyage Detail Page (`app/pages/voyages/[voyageSlug].vue`)

**Location**: `/voyages/[slug]`  
**Layout**: `voyage.vue`

#### Events Needed:

##### A. `view_item` - Product Page View
**Trigger**: When voyage page loads  
**Implementation**: `onMounted` in `[voyageSlug].vue`  
**Data Required**:
```javascript
{
  event: 'view_item',
  ecommerce: {
    value: voyage.pricing.startingPrice,
    currency: 'EUR',
    items: [{
      item_id: voyage.slug,
      item_name: voyage.title,
      item_category: voyage.destination,
      item_category2: voyage.travelType, // Groupe/Individuel
      item_category3: voyage.period,
      item_category4: voyage.experienceType,
      item_category5: voyage.thematique,
      price: voyage.pricing.startingPrice,
      discount: voyage.pricing.earlyBirdReduction || 0
    }]
  }
}
```

##### B. `add_to_wishlist` - Date Selection
**Trigger**: When user clicks a date button in `DateButton.vue`  
**Current**: Has Facebook Pixel tracking (will be removed later)  
**GTM Event**: `add_to_wishlist` (from CSV line 174)  
**File**: `app/components/content/Voyages/DateButton.vue:112`  
**Implementation**:
```javascript
const { trackAddToWishlist } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

// In handleDateClick():
trackAddToWishlist(
  formatVoyageForGtm(voyage),
  date.id,
  numberOfTravelers
)
```

##### C. `voir_photos` - Photo Gallery Click
**Trigger**: When user clicks "Voir les photos" button  
**File**: `app/components/content/Voyages/PhotoGalleryDialog.vue`  
**Line**: Template activator button  
**Implementation**: Add `@click` handler to track before dialog opens

##### D. `clic_partage` - Share Button ✅ LOCATED
**File**: `app/components/content/Voyages/HeroVoyageSection.vue`  
**Lines**: 25 (mobile) and 50 (desktop)  
**Current**: `@click="copyUrl"` - copies URL to clipboard  
**Implementation**: Add tracking in `copyUrl()` method
```javascript
const { trackShareClick } = useGtmTracking()

const copyUrl = () => {
  trackShareClick()
  // existing copy logic...
}
```

##### E. `inscription_alerte` - Alert Subscription ❌ NOT APPLICABLE
**Status**: No alert subscription feature exists  
**Action**: Skip this event

##### F. Additional Voyage Page CTAs
**Files to check**:
- `app/components/content/Voyages/InfoCard.vue` - Sticky sidebar with CTAs
- `app/components/content/Voyages/DatesPricesContainer.vue` - Date selection UI
- `app/components/content/Voyages/PrivateTabContainer.vue` - Private travel form

---

### 2. Checkout Funnel (`app/pages/checkout/index.vue`)

**Component**: `app/components/Funnel/CheckoutStepper.vue`  
**Critical Path**: Main conversion funnel

#### Events Needed:

##### A. Step 0: Skipper Selection
**File**: `app/components/Funnel/Steps/Skipper.vue` (not seen yet)  
**Events**:
- `reservation_step0` - Start booking flow
- `reservation_rdv_step1` - If user selects RDV option
- `devis_step0` - If user selects quote option
- `devis_surmesure_step1` - If user selects custom quote

##### B. Step 1: Details
**File**: `app/components/Funnel/Steps/Details.vue`  
**Events**:
- `reservation_step1` - After form completion
- `reservation_step2` - After "Suivant" click with user data

**Data Required**:
```javascript
{
  event: 'reservation_step2',
  optin_newsletter: true/false,
  user_data: {
    user_id: dynamicDealValues.contactId,
    user_mail: dynamicDealValues.email,
    user_phone: dynamicDealValues.phone,
    user_country: 'France'
  },
  ecommerce: { /* voyage data */ }
}
```

##### C. Step 2: Travelers Info
**File**: `app/components/Funnel/Steps/TravelersInfos.vue` (not seen yet)  
**Event**: `reservation_step3`  
**Trigger**: After entering traveler details + "Suivant"

##### D. Step 3: Options
**File**: `app/components/Funnel/Steps/Options.vue` (not seen yet)  
**Event**: `reservation_step4`  
**Trigger**: After selecting options + "Suivant"

##### E. Step 4: Insurances
**File**: `app/components/Funnel/Steps/Insurances.vue`  
**Event**: `reservation_step5`  
**Trigger**: After insurance selection + "Suivant"

##### F. Step 5: Payment
**File**: `app/components/Funnel/Steps/PaymentRedirect.vue`  
**Events**:
- `add_payment_info` - When payment method selected
- `reservation_pose_option` - If user chooses "Poser une option"
- Backend: `purchase` - On successful payment (webhook)

##### G. RDV Flow (Alternative Path) ✅ CALENDLY INTEGRATION
**File**: `app/components/CalendlyContainer.vue`  
**Current Implementation**: Line 41-45 has Facebook Pixel tracking (will be removed later)

**GTM Events Needed** (from CSV):
- `reservation_rdv_step1` - When Calendly widget loads in funnel (component mounted, if isFunnel)
- `reservation_rdv_step2` - When user selects time slot (Calendly event: `date_and_time_selected`)
- `reservation_rdv_confirmation` - When RDV confirmed (Calendly event: `event_scheduled`)

**Implementation**:
```javascript
const { trackReservationRdvStep1, trackReservationRdvStep2, trackReservationRdvConfirmation } = useGtmTracking()

onMounted(() => {
  if (props.isFunnel) {
    trackReservationRdvStep1(voyage)
  }
})

useCalendlyEventListener({
  onDateAndTimeSelected: () => {
    trackReservationRdvStep2(voyage)
  },
  onEventScheduled: (event) => {
    trackReservationRdvConfirmation({
      user_mail: event.invitee.email,
      user_phone: event.invitee.phone
    })
    // Keep existing trackPixel for now (will be removed later)
  },
})
```

##### H. Devis Flow (Alternative Path) ✅ LOCATED
**Main File**: `app/pages/devis/index.vue`  
**Components**:
- `app/components/Devis/Skipper.vue` - Step 1: Choice selection
- `app/components/Devis/Details.vue` - Step 2: Travel details
- `app/components/Devis/UserInfoForm.vue` - Step 3: User info & submit
- `app/components/CalendlyContainer.vue` - Alternative: RDV option

**Flow Structure**:
```
Step 1 (Skipper) → User selects:
  ├─ "devis" (classic quote) → Step 2 (Details) → Step 3 (UserInfoForm) → Submit
  ├─ "call" (RDV) → CalendlyContainer
  └─ "tally" (custom form) → FunnelTallyForm (external)
```

**Events to Implement**:

**Classic Devis Path**:
- `devis_step0` - Page load (`onMounted` in `devis/index.vue`)
- `devis_classic_step1` - After selecting "devis" option (in `Skipper.vue`)
- `devis_classic_step2` - After filling travel details (in `Details.vue` → `nextStep()`)
- `devis_classic_confirmation` - After submitting user info (in `UserInfoForm.vue` → `submit()`)

**RDV Devis Path**:
- `devis_rdv_step1` - After selecting "call" option (in `Skipper.vue`)
- `devis_rdv_step2` - Calendly date selected (via `useCalendlyEventListener`)
- `devis_rdv_confirmation` - Calendly booking confirmed (via `useCalendlyEventListener`)

**Custom Form Path** (Tally):
- `devis_surmesure_step1` - After selecting "tally" option (in `Skipper.vue`)
- Track Tally form completion if possible (may need Tally webhook)

---

### 3. Search Results Page (`app/pages/voyages/index.vue`)

#### Events Needed:

##### A. `search_bar` - Advanced Search Filters
**Trigger**: When user applies filters (destination, type, period, confirmed only)  
**Current State**: Has `SearchField` component and filter chips  
**Implementation Location**: 
- Filter application in component script
- Checkbox for "Voir tous les départs garantis"
- Reset button click

**Data Structure**:
```javascript
{
  event: 'search_bar',
  destination: routeQuery.destination,
  type_voyage: routeQuery.travelType,
  periode: routeQuery.from + ' - ' + routeQuery.to,
  voyage_garanti: confirmedOnly
}
```

##### B. `view_item_list` - Search Results Display
**Component**: `app/components/DisplayVoyagesRow.vue`  
**Trigger**: When search results are displayed  
**Item List Name**: "Résultats de recherche" or specific filter name

##### C. `select_item` - Already implemented in VoyageCard
**Status**: ✅ Should work via existing card implementation  
**Verify**: item_list_name is passed correctly

---

## 🟡 TODO: Medium Priority (Conversion Support)

### 4. RDV Standalone Page (`app/pages/calendly.vue`)

**Component**: Uses `CalendlyContainer.vue` with `useCalendlyEventListener` hook  
**Current**: Already tracking with Facebook Pixel  
**Implementation Path**: Same as checkout/devis RDV flows

**Events Needed**:
- `rdv_step0` - Page load (onMounted in `calendly.vue`)
- `rdv_step1` - After selecting time slot (Calendly event listener)
- `rdv_confirmation` - After confirming RDV (Calendly event listener)

**Data Structure**:
```javascript
// Step 0
{
  event: 'rdv_step0'
}

// Step 1
{
  event: 'rdv_step1'
}

// Confirmation
{
  event: 'rdv_confirmation',
  user_data: {
    user_mail: event.invitee.email,
    user_phone: event.invitee.phone
  }
}
```

**Implementation**: Use same Calendly event listener hooks as funnel flows  
**Note**: Existing Facebook Pixel tracking will be removed in cleanup phase

---

### 5. Contact & Forms

#### A. Contact Page (`app/pages/contact.vue`)
- Need to review form structure
- Track form submissions

#### B. Custom Travel Page (`app/pages/sur-mesure.vue`)
- Custom travel quote form
- `devis_surmesure_*` events

#### C. Company Page (`app/pages/entreprise.vue`)
- B2B contact forms

---

### 6. Content Pages (Promotions)

#### A. Experiences Pages
**Files**:
- `app/pages/experiences/index.vue`
- `app/pages/experiences/[experienceSlug].vue`

**Events Needed**:
- `view_promotion` - Page load
- `select_promotion` - Card clicks
- `view_item_list` - Related voyages
- `select_item` - Voyage selection

#### B. Thematiques Pages
**Files**:
- `app/pages/thematiques/index.vue`
- `app/pages/thematiques/[thematiqueSlug].vue`

**Events Needed**: Similar to experiences

#### C. Destinations Pages
**Files**:
- `app/pages/destinations/index.vue`
- `app/pages/destinations/[destinationSlug].vue`

**Events Needed**: Similar to experiences

---

### 7. Blog (`app/pages/blog/`)

**Files**:
- `app/pages/blog/index.vue`
- `app/pages/blog/[blogSlug].vue`

**Events**:
- `Blog View` - Géré depuis GTM (automated page view)
- Related voyage clicks - `select_item`

**Note**: CSV says "Géré depuis GTM" - may not need implementation

---

## 🟢 TODO: Lower Priority (Nice to Have)

### 8. Menu Navigation
**Event**: `clic_menu`  
**Location**: Need to find navigation menu component  
**Files to check**:
- Main navigation menu (if separate from header)
- Footer links (may already be covered)

### 9. Additional Pages

#### A. Avis Voyageurs (`app/pages/avis-voyageurs.vue`)
- Review interactions
- Related voyage clicks

#### B. FAQ Page (`app/pages/faq.vue`)
- Already has `clic_faq` via QuestionPanel
- Verify implementation

#### C. Gift Card (`app/pages/offre-cadeau.vue`)
- Form tracking
- CTA clicks

#### D. Cheques Vacances (`app/pages/cheques-vacances.vue`)
- Info page
- CTA tracking

---

## 🔧 Implementation Strategy

### Phase 1: Core Conversion Path (Week 1)
1. ✅ Setup & Infrastructure (DONE)
2. ✅ Homepage (DONE)
3. 🔴 Voyage Detail Page - `view_item`, `add_to_wishlist`, `voir_photos`
4. 🔴 Checkout Funnel - All reservation steps
5. 🔴 Search Results - `search_bar`, `view_item_list`

### Phase 2: Alternative Conversion Paths (Week 2)
6. 🟡 RDV Standalone Page
7. 🟡 Devis/Quote Forms
8. 🟡 Contact Forms

### Phase 3: Content & Discovery (Week 3)
9. 🟡 Experiences/Thematiques/Destinations
10. 🟡 Blog (verify GTM automation)
11. 🟢 Additional content pages

### Phase 4: Polish & Verification (Week 4)
12. 🟢 Menu navigation
13. Test all events in GTM Preview
14. Create comprehensive test plan
15. Document any custom implementations

---

## 📝 Notes & Decisions

### Design Decisions Made:
1. **Stega Cleaning**: All dataLayer pushes automatically clean Sanity Stega encoding
2. **Item List Naming**: Descriptive names for each voyage list context
3. **Conditional Events**: RDV/Call buttons check URL before firing specific events
4. **Debouncing**: Search term tracking debounced to 200ms
5. **Focus on GTM Only**: Not duplicating existing Facebook Pixel tracking (trackPixel will be removed later)

### Questions RESOLVED ✅:
1. ✅ **Share button**: Yes, at `app/components/content/Voyages/HeroVoyageSection.vue:25` and `:50` (mobile + desktop)
2. ✅ **Alert subscription**: No alert feature
3. ✅ **Navigation menu**: `app/components/TopBar.vue` (wrapper for HeaderOdysway + HeaderDrawer)
4. ✅ **Calendly tracking**: `app/components/CalendlyContainer.vue:41` uses `useCalendlyEventListener` hook
5. ✅ **Funnel locations**: 
   - Checkout: `app/pages/checkout/index.vue` → `app/components/Funnel/CheckoutStepper.vue`
   - Devis: `app/pages/devis/index.vue` with steps in `app/components/Devis/`

### Files Located - Ready for Implementation:

**Checkout Funnel**:
- ✅ `app/components/Funnel/CheckoutStepper.vue` - Main stepper
- ✅ `app/components/Funnel/Steps/Skipper.vue` - Step 0
- ✅ `app/components/Funnel/Steps/Details.vue` - Step 1
- ✅ `app/components/Funnel/Steps/TravelersInfos.vue` - Step 2
- ✅ `app/components/Funnel/Steps/Options.vue` - Step 3
- ✅ `app/components/Funnel/Steps/Insurances.vue` - Step 4
- ✅ `app/components/Funnel/Steps/PaymentRedirect.vue` - Step 5
- ✅ `app/components/Funnel/Steps/Summary.vue` - Summary view

**Devis Funnel**:
- ✅ `app/pages/devis/index.vue` - Main page
- ✅ `app/components/Devis/Skipper.vue` - Choice selection
- ✅ `app/components/Devis/Details.vue` - Travel details
- ✅ `app/components/Devis/UserInfoForm.vue` - User info & submit

**Other Components**:
- ✅ `app/components/CalendlyContainer.vue` - RDV widget
- ⏳ `app/components/content/SearchField.vue` - Need to review
- ⏳ `app/components/DisplayVoyagesRow.vue` - Need to review
- ⏳ Contact form components - Need to locate

---

## 🎯 Priority Matrix

| Event Type | Priority | Complexity | Impact |
|------------|----------|------------|--------|
| `view_item` | 🔴 High | 🟢 Low | Critical for product analysis |
| `add_to_wishlist` | 🔴 High | 🟡 Medium | Key funnel entry point |
| Funnel steps | 🔴 High | 🔴 High | Core conversion tracking |
| `search_bar` | 🔴 High | 🟡 Medium | Important for UX insights |
| `voir_photos` | 🟡 Medium | 🟢 Low | Engagement metric |
| RDV flows | 🟡 Medium | 🔴 High | Alternative conversion |
| Content pages | 🟢 Low | 🟢 Low | Nice to have |

---

## 📊 Expected Event Volume (Monthly Estimates)

| Event | Expected Count |
|-------|---------------|
| `page_view` | ~50,000 |
| `view_item` | ~10,000 |
| `add_to_wishlist` | ~2,000 |
| `reservation_step0` | ~1,000 |
| `purchase` | ~100 |
| `search_term` | ~5,000 |
| `select_item` | ~8,000 |

---

---

## 📋 Detailed Implementation Checklist

### Phase 1: Voyage Detail Page (Priority 🔴)

#### File: `app/pages/voyages/[voyageSlug].vue`
- [ ] Add `view_item` tracking on page load (onMounted)
- [ ] Pass voyage data to InfoCard component

#### File: `app/components/content/Voyages/DateButton.vue`
- [ ] Add `add_to_wishlist` tracking in `handleDateClick()` method (line 110)
- [ ] Import `useGtmTracking` and `useGtmVoyageFormatter`
- [ ] Format voyage data before tracking

#### File: `app/components/content/Voyages/PhotoGalleryDialog.vue`
- [ ] Add `voir_photos` tracking when dialog opens
- [ ] Track in activator button click or dialog open watcher

#### File: `app/components/content/Voyages/HeroVoyageSection.vue`
- [ ] Add `clic_partage` tracking in `copyUrl()` method (lines 25, 50)
- [ ] Import `useGtmTracking`

---

### Phase 2: Checkout Funnel (Priority 🔴)

#### File: `app/pages/checkout/index.vue`
- [ ] Add `reservation_step0` on page load

#### File: `app/components/Funnel/Steps/Skipper.vue`
- [ ] Track `reservation_step0` when component mounts
- [ ] Track path selection (reservation vs RDV vs devis)

#### File: `app/components/Funnel/Steps/Details.vue`
- [ ] Add `reservation_step1` when moving to this step
- [ ] Add `reservation_step2` on "Suivant" click with user data
- [ ] Capture: email, phone, optin_newsletter

#### File: `app/components/Funnel/Steps/TravelersInfos.vue`
- [ ] Add `reservation_step3` on "Suivant" click
- [ ] Include traveler count and details

#### File: `app/components/Funnel/Steps/Options.vue`
- [ ] Add `reservation_step4` on "Suivant" click
- [ ] Include selected options in ecommerce data

#### File: `app/components/Funnel/Steps/Insurances.vue`
- [ ] Add `reservation_step5` on "Suivant" click
- [ ] Include insurance selection

#### File: `app/components/Funnel/Steps/PaymentRedirect.vue`
- [ ] Add `add_payment_info` when payment method selected
- [ ] Add `reservation_pose_option` if user clicks "Poser une option"
- [ ] Payment completed (`purchase`) tracked via backend webhook

#### File: `app/components/CalendlyContainer.vue` (in funnel)
- [ ] Add `reservation_rdv_step1` on mount (if isFunnel prop)
- [ ] Add `reservation_rdv_step2` via Calendly event listener (date selected)
- [ ] Add `reservation_rdv_confirmation` via Calendly event listener (booking confirmed)
- [ ] Note: Keep existing Facebook Pixel tracking (will be cleaned up later)

---

### Phase 3: Devis Funnel (Priority 🔴)

#### File: `app/pages/devis/index.vue`
- [ ] Add `devis_step0` on page load (onMounted)

#### File: `app/components/Devis/Skipper.vue`
- [ ] Track choice selection:
  - [ ] `devis_classic_step1` if "devis" selected
  - [ ] `devis_rdv_step1` if "call" selected  
  - [ ] `devis_surmesure_step1` if "tally" selected

#### File: `app/components/Devis/Details.vue`
- [ ] Add `devis_classic_step2` on "Suivant" click
- [ ] Capture travel details (dates, travelers, etc.)

#### File: `app/components/Devis/UserInfoForm.vue`
- [ ] Add `devis_classic_confirmation` on form submit
- [ ] Include user_data (email, phone, country)
- [ ] Include optin_newsletter

#### File: `app/components/CalendlyContainer.vue` (in devis)
- [ ] Reuse RDV tracking from checkout funnel
- [ ] Events: `devis_rdv_step2`, `devis_rdv_confirmation`

---

### Phase 4: Search Results (Priority 🔴)

#### File: `app/pages/voyages/index.vue`
- [ ] Add `search_bar` event when filters applied
- [ ] Track: destination, travelType, dates, confirmedOnly
- [ ] Trigger on filter change or "Apply" button

#### File: `app/components/content/SearchField.vue`
- [ ] Review component structure
- [ ] Add filter change tracking if needed

#### File: `app/components/DisplayVoyagesRow.vue`
- [ ] Add `view_item_list` when results displayed
- [ ] Use IntersectionObserver for lazy loading lists
- [ ] Pass item_list_name to VoyageCard components

---

### Phase 5: RDV Standalone Page (Priority 🟡)

#### File: `app/pages/calendly.vue`
- [ ] Add `rdv_step0` on page load

#### File: `app/components/CalendlyContainer.vue`
- [ ] Already has event listener infrastructure
- [ ] Add GTM events (Facebook Pixel will be removed later):
  - [ ] `rdv_step1` (date selected)
  - [ ] `rdv_confirmation` (booking confirmed)

---

### Phase 6: Additional Functions (Priority 🟢)

#### Update `app/composables/useGtmTracking.js`
Add new tracking functions:
- [ ] `trackViewItem(voyage)` - Product page view
- [ ] `trackAddToWishlist(voyage, dateId, quantity)` - Date selection
- [ ] `trackReservationStep0/1/2/3/4/5(voyage, userData?)` - Funnel steps
- [ ] `trackAddPaymentInfo(voyage, paymentType, userData)` - Payment selection
- [ ] `trackReservationPoseOption(voyage, userData)` - Option placement
- [ ] `trackReservationRdvStep1/2(voyage)` - RDV funnel in checkout
- [ ] `trackReservationRdvConfirmation(userData)` - RDV confirmed
- [ ] `trackDevisStep0()` - Devis page load
- [ ] `trackDevisClassicStep1/2(voyage)` - Classic devis steps
- [ ] `trackDevisClassicConfirmation(voyage, userData)` - Devis submitted
- [ ] `trackDevisRdvStep1/2(voyage)` - RDV in devis
- [ ] `trackDevisRdvConfirmation(userData)` - RDV confirmed in devis
- [ ] `trackDevisSurmesureStep1(voyage)` - Custom form selection
- [ ] `trackRdvStep0/1()` - Standalone RDV page
- [ ] `trackRdvConfirmation(userData)` - Standalone RDV confirmed
- [ ] `trackVoirPhotos()` - Photo gallery opened
- [ ] Already has `trackShareClick()` ✅

---

## 🎯 Implementation Priority Order

### Week 1 - Critical Path (MVP)
1. **Day 1-2**: Voyage detail page (`view_item`, `add_to_wishlist`, `voir_photos`, `clic_partage`)
2. **Day 3-4**: Checkout funnel steps 0-5 (`reservation_step0` through `reservation_step5`)
3. **Day 5**: Search results (`search_bar`, verify `view_item_list`)

### Week 2 - Alternative Conversion Paths
4. **Day 6-7**: Checkout RDV flow (`reservation_rdv_*`)
5. **Day 8-9**: Devis funnel (all `devis_*` events)
6. **Day 10**: Payment & option events (`add_payment_info`, `reservation_pose_option`)

### Week 3 - Supporting Features
7. **Day 11**: RDV standalone page
8. **Day 12-14**: Content pages (experiences, thematiques, destinations)
9. **Day 15**: Testing & bug fixes

### Week 4 - Polish & Launch
10. **Day 16-17**: Comprehensive testing with GTM Preview
11. **Day 18**: Documentation updates
12. **Day 19**: Stakeholder review
13. **Day 20**: Production deployment

---

**Next Steps**: 
1. ✅ All questions resolved - files located
2. 🔴 Begin Phase 1: Implement voyage detail page tracking
3. 🔴 Begin Phase 2: Implement checkout funnel tracking  
4. Create tracking functions in `useGtmTracking.js`
5. Test each phase with GTM Preview mode before moving to next phase
