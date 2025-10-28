# Performance Optimizations - Round 2

Targeting specific issues identified in PageSpeed Insights report.

## Issues Addressed

### 1. ✅ Preconnect to Sanity CDN (300ms LCP improvement)

**Issue:** No preconnect to `https://nu6yntji.apicdn.sanity.io`

**Solution:**
- Added preconnect and dns-prefetch for Sanity image CDN
- This prepares the connection for image loading, reducing latency

**Files Modified:**
- `nuxt.config.ts`

**Expected Impact:** 300ms LCP improvement

### 2. ✅ Hero Image Optimization (120KB savings)

**Issue:** 
- Hero image: 156.9 KB, displayed as 543x412 but downloading much larger
- Could save 120.6 KB with better compression and responsive sizing

**Solution:**
- Added responsive srcset with proper sizes:
  - Mobile (≤600px): 600px width, quality 65
  - Tablet (≤960px): 960px width, quality 70  
  - Desktop: 1536px width, quality 75
- Reduced default quality from 75 to 70
- Added proper `sizes` attribute for browser optimization

**Files Modified:**
- `components/content/HomeHeroSection.vue`

**Expected Impact:** 
- Save ~120KB on mobile
- Faster LCP with appropriately sized images

### 3. ✅ Logo Image Sizing Fix (8KB savings)

**Issue:**
- Logo displayed at 100x25 but actual image is 433x109
- 8.1 KB wasted

**Solution:**
- Added explicit width styling to prevent oversized downloads
- Added `max-width` constraint to limit image size

**Files Modified:**
- `components/HeaderOdysway.vue`

**Expected Impact:** Save 8KB, prevent layout shifts

### 4. ✅ CSS Code Splitting Optimization (1,080ms render blocking savings)

**Issue:**
- 30+ small CSS files loading separately, blocking render
- Main HTML taking 8,130ms

**Solution:**
- Set `cssCodeSplit: false` in Vite config
- This combines CSS into fewer files, reducing HTTP requests
- Critical CSS already inlined via `inlineStyles: true`

**Files Modified:**
- `nuxt.config.ts`

**Expected Impact:** 
- Significant reduction in render-blocking requests
- Faster First Contentful Paint

### 5. ✅ FAQ Background Image Optimization (70KB savings)

**Issue:**
- FAQ background: 133.9 KB, could save 70.1 KB

**Solution:**
- Added responsive srcset with progressive quality:
  - Mobile (≤600px): 600px width, quality 60
  - Tablet (≤960px): 960px width, quality 65
  - Desktop: 1536px width, quality 70
- Reduced default quality from 70 to 65

**Files Modified:**
- `components/content/Voyages/FaqContainer.vue`

**Expected Impact:** Save ~70KB on mobile/tablet

## Total Expected Savings

- **Data Transfer:** ~198 KB (hero + FAQ + logo)
- **Render Blocking Time:** ~1,080ms (CSS optimization)
- **LCP Improvement:** ~300ms (CDN preconnect)

## Next Steps & Additional Optimizations

### Still To Address (if needed after testing):

1. **Main HTML Response Time (8,130ms)**
   - Investigate server-side rendering performance
   - Check if ISR is working correctly
   - Consider edge caching

2. **Facebook Pixel Optimization**
   - Currently loading with 20min cache TTL
   - Consider deferring until consent granted
   - Already handled for Hotjar, apply similar pattern

3. **Component-Level Optimizations**
   - Further lazy load non-critical components
   - Consider virtual scrolling for long lists

4. **Image Format Optimization**
   - All images now using WebP
   - Consider AVIF for even better compression (if supported)

## Testing

After deployment, verify:

1. **PageSpeed Insights:**
   - LCP should be < 2.5s (currently 12.1s, target significant reduction)
   - FCP should improve (currently 4.1s)
   - Render blocking should reduce significantly

2. **Network Tab:**
   - Check CSS file count (should be reduced)
   - Verify image sizes match viewport
   - Confirm CDN preconnect is active

3. **Lighthouse:**
   - Performance score should improve from 55
   - Target: 70+ on mobile

## Notes

- All changes maintain backward compatibility
- Images remain WebP format for broad compatibility
- CSS bundling may increase initial CSS size slightly but reduces request overhead
- Responsive images now properly sized for each viewport

