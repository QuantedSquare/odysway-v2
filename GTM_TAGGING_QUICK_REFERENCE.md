# 🎯 GTM Tagging - Quick Reference

**Quick lookup for what needs tracking and where**

---

## ⚠️ Scope Note

**This document covers ONLY GTM/GA4 events from the CSV tracking plan.**

Existing Facebook Pixel tracking (`trackPixel()`) is NOT included here and will be removed in a separate cleanup phase. Do not duplicate those events.

---

## ✅ COMPLETED (Already Implemented)

| Location | Events | Status |
|----------|--------|--------|
| Homepage | `preload_data`, `view_promotion`, `select_promotion`, `view_item_list`, `select_item`, `clic_nav_slider`, `clic_cta`, `clic_rdv`, `newsletter` | ✅ Done |
| Global Layouts | `clic_whatsapp`, `clic_faq`, `clic_social_media`, `clic_appel`, `clic_menu` | ✅ Done |
| Search Dialog | `search_term`, `select_item`, `clic_cta` (open + filters) | ✅ Done |
| Header/Footer | All navigation & contact CTAs | ✅ Done |

---

## 🔴 HIGH PRIORITY - Core Conversion

### Voyage Detail Page (`/voyages/[slug]`)

| File | Event | Line/Method | Priority |
|------|-------|-------------|----------|
| `pages/voyages/[voyageSlug].vue` | `view_item` | onMounted | 🔴 Critical |
| `Voyages/DateButton.vue` | `add_to_wishlist` | handleDateClick() line 110 | 🔴 Critical |
| `Voyages/PhotoGalleryDialog.vue` | `voir_photos` | Dialog activator | 🔴 High |
| `Voyages/HeroVoyageSection.vue` | `clic_partage` | copyUrl() lines 25, 50 | 🔴 High |

### Checkout Funnel (`/checkout`)

| File | Event | Trigger Point | Priority |
|------|-------|---------------|----------|
| `pages/checkout/index.vue` | `reservation_step0` | onMounted | 🔴 Critical |
| `Funnel/Steps/Skipper.vue` | Flow selection | User choice | 🔴 Critical |
| `Funnel/Steps/Details.vue` | `reservation_step1`, `reservation_step2` | Form submit | 🔴 Critical |
| `Funnel/Steps/TravelersInfos.vue` | `reservation_step3` | Form submit | 🔴 Critical |
| `Funnel/Steps/Options.vue` | `reservation_step4` | Form submit | 🔴 Critical |
| `Funnel/Steps/Insurances.vue` | `reservation_step5` | Form submit | 🔴 Critical |
| `Funnel/Steps/PaymentRedirect.vue` | `add_payment_info`, `reservation_pose_option` | Payment selection | 🔴 Critical |
| `CalendlyContainer.vue` (in funnel) | `reservation_rdv_step1/2/confirmation` | Calendly events | 🔴 Critical |

### Search Results (`/voyages?filters`)

| File | Event | Trigger Point | Priority |
|------|-------|---------------|----------|
| `pages/voyages/index.vue` | `search_bar` | Filter application | 🔴 High |
| `DisplayVoyagesRow.vue` | `view_item_list` | Results display | 🔴 High |
| VoyageCard | `select_item` | Card click | ✅ Done |

---

## 🟡 MEDIUM PRIORITY - Alternative Paths

### Devis Funnel (`/devis`)

| File | Event | Trigger Point |
|------|-------|---------------|
| `pages/devis/index.vue` | `devis_step0` | onMounted |
| `Devis/Skipper.vue` | `devis_classic_step1`, `devis_rdv_step1`, `devis_surmesure_step1` | Choice selection |
| `Devis/Details.vue` | `devis_classic_step2` | Form submit |
| `Devis/UserInfoForm.vue` | `devis_classic_confirmation` | Form submit |
| `CalendlyContainer.vue` (in devis) | `devis_rdv_step2/confirmation` | Calendly events |

### RDV Standalone (`/calendly`)

| File | Event | Trigger Point |
|------|-------|---------------|
| `pages/calendly.vue` | `rdv_step0` | onMounted |
| `CalendlyContainer.vue` | `rdv_step1`, `rdv_confirmation` | Calendly events |

---

## 🟢 LOWER PRIORITY - Content & Discovery

### Content Pages
- **Experiences** (`/experiences/[slug]`) - `view_promotion`, `select_promotion`, `view_item_list`, `select_item`
- **Thematiques** (`/thematiques/[slug]`) - Same as experiences
- **Destinations** (`/destinations/[slug]`) - Same as experiences
- **Blog** (`/blog/[slug]`) - GTM auto-tracking

---

## 🛠️ New Functions Needed in `useGtmTracking.js`

### Product Events
```javascript
trackViewItem(voyage)
trackAddToWishlist(voyage, dateId, quantity)
```

### Reservation Funnel
```javascript
trackReservationStep0(voyage)
trackReservationStep1(voyage)
trackReservationStep2(voyage, userData)
trackReservationStep3(voyage, userData)
trackReservationStep4(voyage, userData)
trackReservationStep5(voyage, userData)
trackAddPaymentInfo(voyage, paymentType, userData)
trackReservationPoseOption(voyage, userData)
```

### Reservation RDV (in funnel)
```javascript
trackReservationRdvStep1(voyage)
trackReservationRdvStep2(voyage)
trackReservationRdvConfirmation(userData)
```

### Devis Funnel
```javascript
trackDevisStep0()
trackDevisClassicStep1(voyage)
trackDevisClassicStep2(voyage)
trackDevisClassicConfirmation(voyage, userData)
trackDevisRdvStep1(voyage)
trackDevisRdvStep2(voyage)
trackDevisRdvConfirmation(userData)
trackDevisSurmesureStep1(voyage)
```

### Standalone RDV
```javascript
trackRdvStep0()
trackRdvStep1()
trackRdvConfirmation(userData)
```

### Engagement
```javascript
trackVoirPhotos()
trackShareClick() // ✅ Already exists
```

---

## 📊 Data Structures Reference

### Basic Voyage Item
```javascript
{
  item_id: voyage.slug,
  item_name: voyage.title,
  item_category: voyage.destination,
  item_category2: voyage.travelType, // Groupe/Individuel
  item_category3: voyage.period,
  item_category4: voyage.experienceType,
  item_category5: voyage.thematique,
  price: voyage.pricing.startingPrice,
  discount: voyage.pricing.discount || 0
}
```

### User Data
```javascript
{
  user_id: contactId,
  user_mail: email,
  user_phone: phone,
  user_country: 'France'
}
```

### Ecommerce Base
```javascript
{
  value: totalPrice,
  currency: 'EUR',
  items: [/* voyage items */]
}
```

---

## 🎯 Implementation Sequence

1. **Week 1**: Voyage page + Checkout steps 0-5 + Search
2. **Week 2**: Checkout RDV + Devis funnel + Payment events
3. **Week 3**: Standalone RDV + Content pages
4. **Week 4**: Testing + Polish + Deploy

---

## ⚡ Quick Commands

### Test Event in Console
```javascript
window.dataLayer.push({
  event: 'test_event',
  test_data: 'value'
})
```

### Check Current DataLayer
```javascript
console.table(window.dataLayer)
```

### Enable GTM Preview
1. Go to GTM container
2. Click "Preview"
3. Enter: `http://localhost:3000`
4. Monitor all events in real-time

---

## 📞 Calendly Events Available

Via `useCalendlyEventListener` (currently has Facebook Pixel tracking that will be removed later):
- `onDateAndTimeSelected` → GTM: `reservation_rdv_step2` / `devis_rdv_step2` / `rdv_step1`
- `onEventScheduled` → GTM: `reservation_rdv_confirmation` / `devis_rdv_confirmation` / `rdv_confirmation`
- User data available in event object: `event.invitee.email`, `event.invitee.phone`

**Note**: Add GTM tracking alongside existing `trackPixel()` calls. The pixel tracking will be cleaned up later.

---

## ✨ Key Implementation Notes

1. **All strings auto-cleaned** from Sanity Stega encoding via `cleanStegaData()`
2. **Voyage formatter** available via `useGtmVoyageFormatter()`
3. **Conditional RDV tracking** checks URL contains 'calendly' or 'rdv'
4. **Search debounced** at 200ms to avoid excessive events
5. **Page type** uses raw path (not categorized) per user preference
6. **GTM ONLY** - Don't duplicate Facebook Pixel events (trackPixel will be removed later)

---

**Last Updated**: 2026-01-22  
**Status**: Planning Complete - Ready for Implementation
