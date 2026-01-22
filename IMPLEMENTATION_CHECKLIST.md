# GTM Implementation Checklist

## Pre-Deployment Checklist

Before deploying the GTM implementation to production, verify the following:

### 1. Configuration ✅

- [x] GTM script added to `nuxt.config.ts` with correct container ID (`GTM-NP63ZR5`)
- [x] Noscript fallback included in `nuxt.config.ts`
- [x] Plugin `analytics.client.ts` properly configured
- [x] Employee opt-out cookie check in place

### 2. Core Files ✅

- [x] `app/composables/useGtmTracking.js` created
- [x] `app/composables/useGtmVoyageFormatter.js` created
- [x] `app/components/tracking/TrackableVoyageList.vue` created
- [x] `app/plugins/analytics.client.ts` updated

### 3. Component Updates ✅

- [x] `HorizontalCarousel.vue` - Slider tracking
- [x] `ExperienceCarousel.vue` - Promotion tracking
- [x] `ThematiqueColCard.vue` - Promotion selection
- [x] `VoyageCard.vue` - Item selection
- [x] `NextDepartureCard.vue` - Item selection
- [x] `VoyageCardWithDates.vue` - Props passthrough
- [x] `ctaButton.vue` - CTA tracking
- [x] `NewsletterContainer.vue` - Newsletter tracking

### 4. Homepage Implementation ✅

- [x] Experience carousel tracking
- [x] 4 voyage list sections with tracking
- [x] CTA buttons tracked
- [x] Newsletter subscription tracked
- [x] Slider navigation tracked

### 5. Documentation ✅

- [x] `docs/GTM_TRACKING_IMPLEMENTATION.md` - Technical docs
- [x] `docs/GTM_QUICK_REFERENCE.md` - Developer reference
- [x] `docs/GTM_EVENT_FLOW.md` - Visual diagrams
- [x] `GTM_IMPLEMENTATION_SUMMARY.md` - Summary
- [x] `IMPLEMENTATION_CHECKLIST.md` - This file

## Testing Checklist

### Browser Console Testing

- [ ] Open browser DevTools console
- [ ] Navigate to homepage
- [ ] Verify `📊 GTM Event: preload_data` appears
- [ ] Scroll through page and verify events fire:
  - [ ] `view_promotion` for experience carousel
  - [ ] `view_item_list` for each voyage section (4 times)
  - [ ] `clic_nav_slider` when clicking arrows
  - [ ] `select_promotion` when clicking experience card
  - [ ] `select_item` when clicking voyage card
  - [ ] `clic_cta` when clicking CTA buttons
  - [ ] `clic_rdv` when clicking RDV button
  - [ ] `newsletter` when subscribing

### GTM Preview Mode Testing

- [ ] Open GTM container in Google Tag Manager
- [ ] Click "Preview" button
- [ ] Enter your site URL
- [ ] Navigate to homepage
- [ ] Verify in GTM debugger:
  - [ ] Container loads successfully
  - [ ] `preload_data` fires on page load
  - [ ] All homepage events appear in correct sequence
  - [ ] Event data structure matches tracking plan
  - [ ] No errors in GTM debugger

### Data Structure Verification

- [ ] Check `window.dataLayer` in console
- [ ] Verify each event has correct structure:
  - [ ] `preload_data` has `page_type`
  - [ ] `view_item_list` has proper ecommerce object
  - [ ] `select_item` has proper ecommerce object
  - [ ] `newsletter` has `user_data.user_mail`
  - [ ] `clic_cta` has `ctaId`, `ctaLabel`, `ctaUrl`

### Navigation Testing

- [ ] Test SPA navigation (click internal links)
- [ ] Verify `preload_data` fires on each navigation
- [ ] Check page type detection:
  - [ ] `/` → `Homepage`
  - [ ] `/voyages/some-slug` → `Page Voyage`
  - [ ] `/blog` → `Blog`
  - [ ] `/avis-voyageurs` → `Page Avis`
  - [ ] `/other` → `Autres`

### Edge Cases

- [ ] Test with ad blocker enabled (should still work)
- [ ] Test with JavaScript disabled (noscript fallback)
- [ ] Test on mobile devices
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test with employee opt-out cookie set

## Production Deployment

### Pre-Deploy

- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Team briefed on new tracking
- [ ] GTM container published (if needed)
- [ ] Backup current code

### Deploy

- [ ] Deploy to staging first
- [ ] Test on staging environment
- [ ] Monitor for errors
- [ ] Deploy to production
- [ ] Monitor production logs

### Post-Deploy

- [ ] Verify GTM container loads
- [ ] Check GA4 real-time reports for events
- [ ] Monitor for 24 hours
- [ ] Check error logs
- [ ] Verify data in GA4 matches expectations

## GA4 Verification

### Real-Time Reports

- [ ] Open GA4 property
- [ ] Go to Reports → Real-time
- [ ] Navigate through site
- [ ] Verify events appear in real-time:
  - [ ] `preload_data`
  - [ ] `view_promotion`
  - [ ] `select_promotion`
  - [ ] `view_item_list`
  - [ ] `select_item`
  - [ ] `clic_nav_slider`
  - [ ] `clic_cta`
  - [ ] `clic_rdv`
  - [ ] `newsletter`

### Event Parameters

- [ ] Check each event has correct parameters
- [ ] Verify ecommerce data structure
- [ ] Check user_data appears for newsletter
- [ ] Verify all item categories are populated

## Known Issues / Notes

### Current Limitations

1. Only homepage is fully implemented
2. Booking funnel events not yet implemented
3. Quote funnel events not yet implemented
4. Voyage page specific events not yet implemented
5. Search events structure in place but need page implementation

### Future Work

1. Extend to other pages (see GTM_IMPLEMENTATION_SUMMARY.md)
2. Add booking funnel tracking
3. Add quote funnel tracking
4. Add voyage page tracking
5. Add search functionality tracking

## Troubleshooting

### Events Not Firing

1. Check browser console for errors
2. Verify GTM container ID is correct
3. Check employee opt-out cookie
4. Verify dataLayer exists: `console.log(window.dataLayer)`
5. Check GTM Preview mode for errors

### Events Firing Multiple Times

1. Check if component is mounting multiple times
2. Verify Intersection Observer disconnects properly
3. Check for duplicate event listeners

### Wrong Data Structure

1. Review tracking plan CSV
2. Check composable function implementation
3. Verify data formatting in components
4. Test in GTM Preview mode

### TypeScript Errors

1. Check `window.dataLayer` type declaration in plugin
2. Verify route type annotations
3. Run `npm run typecheck`

## Support Contacts

- **GTM Expert**: [Expert Name/Contact]
- **Developer**: Check git blame for recent changes
- **Documentation**: `/docs/GTM_*.md` files

## Sign-Off

Implementation completed by: _________________

Date: _________________

Tested by: _________________

Date: _________________

Approved for production: _________________

Date: _________________
