export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const pixelId = config.public.metapixel?.default?.id

  // Only proceed in production and if pixel ID is available
  if (!pixelId || config.public.environment !== 'production') {
    return
  }

  if (typeof window === 'undefined') return

  let pixelInitialized = false

  // Function to initialize Facebook Pixel
  const initFacebookPixel = () => {
    if (pixelInitialized || window.fbq) return // Already initialized

    // Standard Facebook Pixel initialization code
    !function(f, b, e, v, n, t, s) {
      if (f.fbq) return
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
      }
      if (!f._fbq) f._fbq = n
      n.push = n
      n.loaded = !0
      n.version = '2.0'
      n.queue = []
      t = b.createElement(e)
      t.async = !0
      t.src = v
      s = b.getElementsByTagName(e)[0]
      s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

    // Wait for fbq to be available, then initialize
    const waitForFbq = () => {
      if (window.fbq) {
        window.fbq('init', pixelId)
        pixelInitialized = true
      } else {
        setTimeout(waitForFbq, 10)
      }
    }
    waitForFbq()
  }

  // Check if consent is already granted and initialize immediately
  if (localStorage.getItem('consent') === 'granted') {
    initFacebookPixel()
  }

  // Listen for storage changes to handle consent updates from other tabs
  const handleStorageChange = (e) => {
    if (e.key === 'consent' && e.newValue === 'granted') {
      initFacebookPixel()
    }
  }
  window.addEventListener('storage', handleStorageChange)

  // Watch for consent changes in the same tab by checking localStorage periodically
  let lastConsent = localStorage.getItem('consent')
  const checkConsent = () => {
    const currentConsent = localStorage.getItem('consent')
    if (currentConsent !== lastConsent && currentConsent === 'granted') {
      initFacebookPixel()
    }
    lastConsent = currentConsent
  }
  
  // Check every 100ms if consent was granted
  const interval = setInterval(() => {
    checkConsent()
    if (pixelInitialized) {
      clearInterval(interval)
    }
  }, 100)

  // Also expose a function to manually trigger initialization (for when consent is granted)
  window.__initFacebookPixel = initFacebookPixel
})

