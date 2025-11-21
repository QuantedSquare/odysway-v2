/**
 * CSS Async Loading Plugin
 * Makes CSS load asynchronously to prevent render blocking using media query trick
 * This prevents FOUC while still allowing non-blocking CSS loading
 * 
 * The media="print" trick makes the browser load CSS with low priority (non-blocking)
 * Then we change it to "all" once loaded to apply the styles
 */
export default defineNuxtPlugin({
  name: 'css-async',
  enforce: 'pre', // Run early, before other plugins
  setup() {
    if (import.meta.server) return

    function makeCSSAsync() {
      // Find all blocking stylesheet links (exclude print media and already processed)
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"]):not([data-async])')
      
      if (stylesheets.length === 0) return
      
      stylesheets.forEach((link) => {
        // Skip if already processed
        if (link.dataset.async) return
        
        // Mark as async to prevent duplicate processing
        link.dataset.async = 'true'
        
        // Use media query trick: set to "print" initially (non-blocking)
        // The browser treats print media as low priority, so it won't block render
        const originalMedia = link.media || 'all'
        link.media = 'print'
        
        // Once the stylesheet loads, change media back to "all" to apply styles
        // This prevents FOUC while still allowing non-blocking load
        link.onload = function() {
          this.media = originalMedia
          this.onload = null
        }
        
        // If onload doesn't fire (already cached), set media immediately
        if (link.sheet || link.styleSheet) {
          link.media = originalMedia
        }
      })
    }

    // Run immediately - don't wait for DOMContentLoaded
    // This ensures we catch stylesheets before they block render
    if (document.head) {
      makeCSSAsync()
      // Also watch for dynamically added stylesheets
      const observer = new MutationObserver(makeCSSAsync)
      observer.observe(document.head, { childList: true, subtree: true })
    } else {
      // Fallback: wait for head to be available
      const checkHead = setInterval(() => {
        if (document.head) {
          clearInterval(checkHead)
          makeCSSAsync()
        }
      }, 10)
    }
  },
})

