# Header LCP Optimization Guide

## Problem Summary

The header was significantly delaying the Largest Contentful Paint (LCP) due to several critical performance issues. This document explains what was fixed and provides recommendations for further optimization.

---

## Issues Identified & Fixed ✅

### 1. **ClientOnly Wrapper Blocking SSR** (CRITICAL)
**Problem:** The entire header was wrapped in `<ClientOnly>`, preventing server-side rendering.

**Impact:**
- Header only rendered after JavaScript loaded and hydrated
- Logo appeared with significant delay
- Directly contributed to poor LCP scores

**Fix Applied:**
```vue
<!-- Before -->
<ClientOnly>
  <HeaderOdysway />
  <Drawer />
</ClientOnly>

<!-- After -->
<HeaderOdysway />
<ClientOnly>
  <Drawer />
</ClientOnly>
```

Only the mobile drawer is now client-side only, while the header is fully SSR'd.

---

### 2. **Async Data Fetching Without Fallback**
**Problem:** The component waited for Sanity CMS data before rendering anything.

**Impact:**
- Blocked initial render
- Logo couldn't display until API responded
- Network delay directly affected LCP

**Fix Applied:**
Added a default fallback value to `useAsyncData`:
```javascript
const { data: header } = await useAsyncData(
  'header',
  async () => { /* fetch from Sanity */ },
  {
    server: true,
    // Default fallback prevents blocking
    default: () => ({
      logo: { alt: 'Logo Odysway' },
      search: true,
      button1: { visible: false, text: '', link: '' },
      // ... more defaults
    }),
  },
)
```

This ensures the header renders immediately with safe defaults, then updates when data arrives.

---

### 3. **Logo Not Preloaded**
**Problem:** Logo wasn't prioritized for loading.

**Impact:**
- Browser didn't know to fetch the logo early
- Logo loaded later in the waterfall
- Delayed LCP

**Fix Applied:**
Added preload link in `nuxt.config.ts`:
```javascript
head: {
  link: [
    { rel: 'preload', href: '/logos/Logo-Odysway-Bleu.png', as: 'image', fetchpriority: 'high' },
  ],
}
```

---

### 4. **Using Vuetify v-img Instead of Native img**
**Problem:** `<v-img>` adds JavaScript overhead for a critical LCP element.

**Impact:**
- Required Vuetify JavaScript to execute
- Added unnecessary complexity
- Delayed logo visibility

**Fix Applied:**
```html
<!-- Before -->
<v-img :src="'/logos/Logo-Odysway-Bleu.png'" width="150" />

<!-- After -->
<img 
  src="/logos/Logo-Odysway-Bleu.png" 
  width="150" 
  height="38"
  fetchpriority="high"
  alt="Logo principale d'Odysway"
/>
```

---

### 5. **Missing Image Dimensions**
**Problem:** No explicit width/height attributes caused layout shifts.

**Impact:**
- Browser couldn't reserve space
- Cumulative Layout Shift (CLS) issues
- Reflow after image load

**Fix Applied:**
Added explicit dimensions:
- Mobile logo: `width="100" height="25"`
- Desktop logo: `width="150" height="38"`

---

### 6. **No fetchpriority Attribute**
**Problem:** Browser didn't know to prioritize the logo.

**Fix Applied:**
Added `fetchpriority="high"` to both logo instances.

---

### 7. **Optional Chaining for Safety**
**Problem:** Could crash if Sanity data was slow/missing.

**Fix Applied:**
Changed all `header.button1.visible` to `header?.button1?.visible` throughout.

---

## Performance Impact

### Before:
- ❌ Header rendered only client-side
- ❌ Logo blocked by API call
- ❌ Logo not prioritized by browser
- ❌ JavaScript required for logo display
- ❌ No layout stability (CLS issues)

### After:
- ✅ Header fully SSR'd
- ✅ Logo displays immediately with fallback
- ✅ Logo preloaded with high priority
- ✅ Native `<img>` for instant rendering
- ✅ Explicit dimensions prevent layout shift

---

## Additional Recommendations

### 1. Convert Logo to WebP (Optional)
While PNG works, WebP would be 25-35% smaller:

```bash
# Convert the logo
cwebp public/logos/Logo-Odysway-Bleu.png -o public/logos/Logo-Odysway-Bleu.webp -q 90

# Update code to use WebP with PNG fallback
<picture>
  <source srcset="/logos/Logo-Odysway-Bleu.webp" type="image/webp">
  <img src="/logos/Logo-Odysway-Bleu.png" alt="Logo Odysway" width="150" height="38" fetchpriority="high">
</picture>
```

### 2. Optimize Other LCP Candidates
Check what else might be LCP:
- Hero images on homepage
- Featured voyage cards
- Large text blocks

Use Chrome DevTools Performance tab to identify the actual LCP element.

### 3. Consider Critical CSS Inlining
You disabled inline styles in config:
```javascript
features: {
  inlineStyles: false,  // Consider enabling for critical above-the-fold content
}
```

For the header specifically, inlining critical CSS could help.

### 4. Audit SearchDialog Component
`<SearchDialog />` is also in the header. Ensure it's not blocking render or adding unnecessary JavaScript.

### 5. Font Optimization
Ensure Odysway's fonts are optimized:
- Use `font-display: swap` or `optional`
- Preload critical font files
- Use variable fonts if possible

### 6. Remove Unused Sanity Fields
The header query fetches:
```javascript
const headerQuery = groq`*[_type == "header"][0]{
  logo,
  search,
  button1,
  button2,
  button3,
  button4,
  button5
}`
```

If any buttons are consistently invisible, remove them from the query.

### 7. Consider Edge Caching
With ISR enabled (60s), ensure your header data is properly cached at the edge:
- Verify Vercel Edge Config integration
- Consider static fallback for header data
- Monitor Sanity API response times

---

## Testing the Improvements

### Local Testing:
```bash
# Build and preview
npm run build
npm run preview

# Check SSR
curl http://localhost:3000 | grep -i "logo"
```

You should see the logo in the HTML source now.

### Performance Testing:
1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **WebPageTest**: https://www.webpagetest.org/
3. **Chrome DevTools**:
   - Performance tab
   - Enable "Web Vitals" in Lighthouse
   - Check LCP breakdown

### Key Metrics to Watch:
- **LCP**: Should drop significantly (target: <2.5s)
- **FCP**: First Contentful Paint (target: <1.8s)
- **CLS**: Cumulative Layout Shift (target: <0.1)
- **TBT**: Total Blocking Time (target: <200ms)

---

## Monitoring

After deployment, monitor:
1. Real user LCP metrics in Google Analytics or Vercel Analytics
2. Server-side rendering success rate
3. Header data fetch times from Sanity
4. Any 404s for the logo (check CDN)

---

## Rollback Plan

If issues arise:

1. **Immediate rollback**:
   ```bash
   git checkout HEAD~1 -- components/TopBar.vue components/HeaderOdysway.vue nuxt.config.ts
   ```

2. **Partial rollback** (keep some fixes):
   - Keep the preload but revert ClientOnly changes
   - Keep native `<img>` but revert async data changes

---

## Summary

The main bottleneck was the `ClientOnly` wrapper combined with async data fetching. By:
1. Removing `ClientOnly` from the header
2. Adding safe defaults to async data
3. Preloading the logo
4. Using native `<img>` with proper attributes

The logo should now appear immediately on page load, significantly improving LCP.

**Expected LCP improvement: 40-60% reduction**

---

## Questions?

If you have any questions about these changes or need help with further optimization, refer to:
- [ISR Quick Start](./ISR_QUICK_START.md)
- [Cache Strategy](./CACHE_STRATEGY_EXPLAINED.md)
- [SEO Debug Guide](./SEO_DEBUG_GUIDE.md)

