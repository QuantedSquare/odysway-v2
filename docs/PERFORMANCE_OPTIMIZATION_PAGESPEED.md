# PageSpeed Performance Optimizations

This document details the optimizations implemented to address the PageSpeed Web.dev performance issues.

## Issues Addressed

### 1. ✅ Render-Blocking CSS (160ms savings)

**Problem:**
- The `/_nuxt/style.D9r2NJ8t.css` file (62.8 KiB) was blocking the initial page render
- This file was loaded synchronously, delaying the First Contentful Paint (FCP) and Largest Contentful Paint (LCP)

**Solution:**
- **Enabled critical CSS inlining** in `nuxt.config.ts`:
  ```js
  features: {
    inlineStyles: true, // Inline critical CSS to eliminate render-blocking CSS request
  }
  ```
- **Enabled CSS code splitting** for better caching and parallel loading:
  ```js
  build: {
    cssCodeSplit: true, // Split CSS per route for better caching
    cssMinify: 'lightningcss', // Use faster CSS minifier
    minify: 'esbuild', // Use esbuild for faster minification
  }
  ```

**Benefits:**
- Critical CSS is now inlined in the HTML, allowing the page to render immediately
- Non-critical CSS is loaded asynchronously
- Better caching strategy with split CSS files
- Estimated savings: **160ms**

---

### 2. ✅ Sanity CDN Preconnect (310ms LCP savings)

**Problem:**
- The browser wasn't establishing early connections to Sanity CDN
- PageSpeed recommended preconnecting to `https://nu6yntji.apicdn.sanity.io`
- This was causing delays in loading the hero image (LCP element)

**Solution:**
- **Prioritized Sanity preconnect hints** by moving them to the top of the link array in `nuxt.config.ts`:
  ```js
  link: [
    // Critical: Preconnect to Sanity CDN for LCP image (must be first)
    { rel: 'preconnect', href: 'https://nu6yntji.apicdn.sanity.io', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://cdn.sanity.io', crossorigin: 'anonymous' },
    // Other resource hints follow...
  ]
  ```

**Benefits:**
- Browser establishes TCP connection, TLS handshake earlier in the page load
- Hero images from Sanity load faster
- Improved LCP timing
- Estimated savings: **310ms for LCP**

---

### 3. ✅ Forced Layout Reflow (59ms)

**Problem:**
- Multiple components were reading layout properties (`scrollHeight`, `offsetWidth`) immediately after DOM changes
- This forced the browser to recalculate layouts synchronously, blocking the main thread
- Common culprits:
  - `AvatarsRowStack.vue` - reading `scrollHeight` in hover animations
  - `AuthorNote.vue` - reading `scrollHeight` for expand/collapse animations
  - `DayCard.vue` - dispatching unnecessary resize events

**Solution:**

#### Created a utility composable: `composables/useLayoutRead.js`
This utility batches layout reads using `requestAnimationFrame` to avoid forced reflow:

```js
export function useLayoutRead() {
  const scheduleLayoutRead = (callback) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const result = callback()
        resolve(result)
      })
    })
  }

  const readScrollHeight = (elementRef) => {
    const element = unref(elementRef)
    if (!element) return Promise.resolve(0)
    return scheduleLayoutRead(() => element.scrollHeight)
  }
  
  // ... other helpers
}
```

#### Updated components to use batched layout reads:

1. **AvatarsRowStack.vue**
   - Changed: Direct `scrollHeight` access → `await readScrollHeight(element)`
   - Impact: Hover animations no longer cause forced reflow

2. **AuthorNote.vue**
   - Changed: Direct `scrollHeight` access → `await readScrollHeight(content.value)`
   - Impact: Expand/collapse animations are now optimized

3. **DayCard.vue**
   - Removed: Unnecessary `window.dispatchEvent(new Event('resize'))`
   - Impact: Component hydration no longer triggers forced reflows

**Benefits:**
- Layout reads are batched in animation frames
- Browser can optimize layout calculations
- Smoother animations and interactions
- Reduced main thread blocking time: **59ms**

---

### 4. ✅ Vuetify Bundle Size Optimization

**Problem:**
- Vuetify was generating a large CSS bundle (62.8 KiB)
- Even though using tree-shaking, the CSS file was still too large
- All Vuetify styles were being imported via `@use 'vuetify'` in main.scss

**Solution:**

#### Enhanced Vuetify configuration:
```js
vuetify({ 
  autoImport: true,
  styles: {
    configFile: 'assets/scss/main.scss',
  },
})
```

#### Optimized build configuration:
```js
build: {
  cssCodeSplit: true, // Enable CSS code splitting
  cssMinify: 'lightningcss', // Use faster CSS minifier
  minify: 'esbuild', // Use esbuild for faster minification
}
```

#### Added SCSS optimizations:
```js
css: {
  preprocessorOptions: {
    scss: {
      quietDeps: true, // Suppress dependency warnings
    },
  },
}
```

**Benefits:**
- Reduced CSS bundle size through code splitting
- Better tree-shaking of unused Vuetify components
- Faster CSS minification with lightningcss
- Better caching strategy with split CSS files

---

## Implementation Summary

### Files Modified:
1. ✅ `nuxt.config.ts` - Build optimizations, preconnect hints, CSS configuration
2. ✅ `composables/useLayoutRead.js` - **NEW** - Layout read utility
3. ✅ `components/content/AvatarsRowStack.vue` - Applied layout read batching
4. ✅ `components/content/Voyages/AuthorNote.vue` - Applied layout read batching
5. ✅ `components/content/Voyages/DayCard.vue` - Removed forced reflow trigger

### Key Optimizations:
1. **Critical CSS Inlining** → Eliminates render-blocking CSS
2. **Sanity Preconnect** → Faster LCP image loading
3. **Layout Read Batching** → Prevents forced reflow
4. **CSS Code Splitting** → Better caching and parallel loading
5. **Vuetify Tree-shaking** → Smaller bundle sizes

---

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Render-blocking resources | 160ms delay | ~0ms | **-160ms** |
| LCP (Sanity images) | +310ms | ~0ms | **-310ms** |
| Forced layout reflow | 59ms | ~0ms | **-59ms** |
| **Total Savings** | - | - | **~529ms** |

---

## Testing & Validation

### To verify these optimizations:

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Test on PageSpeed Insights:**
   - Visit: https://pagespeed.web.dev/
   - Enter your production URL
   - Check for improvements in:
     - ✅ Render-blocking resources
     - ✅ Largest Contentful Paint (LCP)
     - ✅ Forced layout reflow
     - ✅ Network request chains

3. **Test locally:**
   ```bash
   npm run preview
   ```
   - Open DevTools → Performance tab
   - Record page load
   - Check for:
     - No forced reflow warnings
     - Faster FCP and LCP times
     - Smaller CSS bundles

---

## Monitoring & Maintenance

### Watch for:
1. **New components reading layout properties** - Use `useLayoutRead()` composable
2. **Large CSS bundles** - Monitor build output for CSS file sizes
3. **Missing preconnect hints** - Add preconnect for new critical domains
4. **Critical CSS changes** - Verify inlineStyles is still enabled

### Best Practices:
- ✅ Always use `useLayoutRead()` when reading `scrollHeight`, `offsetWidth`, `getBoundingClientRect()`
- ✅ Add preconnect hints for domains serving LCP content
- ✅ Keep CSS code splitting enabled for better caching
- ✅ Monitor bundle sizes after adding new dependencies

---

## Additional Resources

- [Web.dev - Optimize LCP](https://web.dev/optimize-lcp/)
- [Web.dev - Avoid forced reflow](https://web.dev/avoid-layout-thrashing/)
- [Vuetify - Tree-shaking](https://vuetifyjs.com/en/features/treeshaking/)
- [Nuxt - Performance](https://nuxt.com/docs/guide/concepts/rendering#performance)

