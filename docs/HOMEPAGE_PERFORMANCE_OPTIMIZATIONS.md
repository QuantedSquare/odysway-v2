# Homepage Performance Optimizations

This document outlines the performance optimizations implemented for the homepage, specifically targeting mobile performance and Core Web Vitals.

## Optimizations Implemented

### 1. Largest Contentful Paint (LCP) Optimization ✅

**Hero Image Optimization:**
- Added `loading="eager"` to hero image to prioritize loading
- Added `fetchpriority="high"` to mark hero image as high priority
- Added hero image preload in the page head with `fetchpriority="high"`
- Hero image now loads immediately without lazy loading

**Files Modified:**
- `components/content/HomeHeroSection.vue`
- `pages/index.vue`

### 2. Third-Party Script Deferral ✅

**Hotjar Script:**
- Moved Hotjar script from synchronous head loading to deferred loading
- Script now loads using `requestIdleCallback` with 2s timeout
- Falls back to loading on first user interaction (mousedown, touchstart, keydown)
- Added preconnect and dns-prefetch for Hotjar domain to prepare connection

**Impact:** Reduces initial JavaScript parse/execute time, improving Time to Interactive (TTI)

**Files Modified:**
- `app.vue`

### 3. Lazy Loading Below-Fold Content ✅

**Homepage Components:**
All below-fold sections now use lazy loading:
- `LazyExperienceCarousel`
- `LazyHorizontalCarousel` (all instances)
- `LazyColorContainer` (all instances)
- `LazyCardGrid`
- `LazyTextImageContainer`
- `LazyCommonReviewContainer`
- `LazyInfoContainer`

**Impact:** 
- Reduces initial JavaScript bundle size
- Defers loading of non-critical components
- Improves First Contentful Paint (FCP) and Time to Interactive (TTI)

**Files Modified:**
- `pages/index.vue`

### 4. Font Loading Optimization ✅

**Status:** Already optimized with `font-display: swap` in `assets/scss/_fonts.scss`

Fonts are preloaded in `app.vue` with proper crossorigin attributes.

### 5. Resource Hints ✅

**DNS Prefetch Added:**
- `https://www.googletagmanager.com`
- `https://www.google-analytics.com`
- `https://connect.facebook.net`
- `https://static.hotjar.com`

**Preconnect Added:**
- `https://cdn.sanity.io` (for image CDN)

**Impact:** 
- Reduces DNS lookup time for external resources
- Pre-establishes connections to CDN
- Improves image loading performance

**Files Modified:**
- `nuxt.config.ts`
- `app.vue`

### 6. Image Loading Attributes ✅

**Hero Image:**
- `loading="eager"` 
- `fetchpriority="high"`
- Proper srcset with responsive sizes
- WebP format with quality optimization

**Other Images:**
- Already using `loading="lazy"` for below-fold images
- Proper srcset attributes
- WebP format conversion

## Expected Performance Improvements

### Core Web Vitals

1. **LCP (Largest Contentful Paint)**
   - Target: < 2.5s
   - Expected improvement: 30-50% reduction
   - Optimizations: Hero image eager loading, preload, fetchpriority

2. **FID (First Input Delay) / INP (Interaction to Next Paint)**
   - Target: < 100ms
   - Expected improvement: 40-60% reduction
   - Optimizations: Deferred third-party scripts, lazy loading

3. **CLS (Cumulative Layout Shift)**
   - Target: < 0.1
   - Status: Should remain stable with existing implementations

### Loading Metrics

1. **Time to Interactive (TTI)**
   - Expected improvement: 20-40% reduction
   - Optimizations: Lazy loading, script deferral

2. **Total Blocking Time (TBT)**
   - Expected improvement: 30-50% reduction
   - Optimizations: Deferred scripts, code splitting

3. **JavaScript Bundle Size (Initial)**
   - Expected improvement: 30-40% reduction
   - Optimizations: Lazy loading components

## Testing Recommendations

1. **PageSpeed Insights**
   - Run test on mobile device preset
   - Monitor Core Web Vitals scores
   - Check for any regressions

2. **Lighthouse CI** (if available)
   - Set performance budgets
   - Monitor LCP, FID, CLS scores

3. **Real User Monitoring (RUM)**
   - Monitor actual user experience
   - Track Core Web Vitals in production

4. **Network Throttling Testing**
   - Test on 3G networks
   - Verify lazy loading works correctly
   - Ensure critical resources load first

## Additional Recommendations

1. **Consider Image CDN**
   - If not already using, consider Sanity's CDN optimization
   - Implement responsive images with proper sizes

2. **Critical CSS**
   - Ensure critical CSS is inlined (already configured in nuxt.config.ts)
   - Verify above-fold content styles load first

3. **Service Worker** (Future)
   - Consider implementing service worker for caching
   - Pre-cache critical assets

4. **Reduce Data Transfer**
   - Review Sanity query to only fetch needed fields
   - Consider pagination for large lists

5. **Optimize Fonts Further**
   - Consider subsetting fonts to reduce size
   - Load only required font weights initially

## Monitoring

After deployment:
1. Monitor PageSpeed Insights scores
2. Check Core Web Vitals in Google Search Console
3. Monitor bundle size in build output
4. Track real-user performance metrics

## Notes

- All changes maintain backward compatibility
- No breaking changes to component APIs
- Lazy loading uses Nuxt's built-in lazy component feature
- Scripts are deferred, not removed (analytics still work)

