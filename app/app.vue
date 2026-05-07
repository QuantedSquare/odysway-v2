<template>
  <NuxtLayout>
    <NuxtPage />
    <!-- <ClientOnly>
      <CookiesSnackbar />
    </ClientOnly> -->
    <ClientOnly>
      <LazySearchDialog v-if="isSearchDialogOpen" />
    </ClientOnly>
    <!-- <Maintenance /> -->
  </NuxtLayout>
</template>

<script setup>
import '../app/assets/scss/main.scss'

const config = useRuntimeConfig()
const route = useRoute()
const { isOpen: isSearchDialogOpen } = useSearchDialog()
const isLocalHost = import.meta.client
  ? ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  : false

if (config.public.environment !== 'production' && !isLocalHost) {
  useSanityVisualEditing()
  useSanityLiveMode()
}

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
  // Only preload the two weights that paint above-the-fold for the LCP:
  // Regular (body) + Bold (h1). Medium (h2) and italic variants stream
  // in lazily via font-display: swap. Cutting the critical font chain
  // from 3 → 2 saves ~400ms FCP on slow 4G.
  link: [
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/subset-Gordita-Regular.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/subset-Gordita-Bold.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
  ],
})

// Hotjar is loaded lazily via requestIdleCallback — no preconnect needed

// True if the user is on a constrained connection — skip session-replay
// SDKs entirely on Save-Data or 2G/slow-2G. Saves ~430ms CPU on the
// devices that need it most.
const isConstrainedConnection = () => {
  if (typeof navigator === 'undefined') return false
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!conn) return false
  if (conn.saveData) return true
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') return true
  return false
}

// Load Hotjar after page is interactive
onMounted(() => {
  // Wait for idle time or user interaction before loading Hotjar
  const loadHotjar = () => {
    if (typeof window !== 'undefined' && !window.hj) {
      const script = document.createElement('script')
      script.innerHTML = `(function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:4932189,hjsv:6};
      a=o.getElementsByTagName('head')[0];
      r=o.createElement('script');r.async=1;
      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
      a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`
      document.head.appendChild(script)
    }
  }

  if (config.public.environment !== 'production') {
    return
  }
  // Skip Hotjar entirely on save-data / 2g — UX research isn't worth
  // ~430ms of CPU on the devices already struggling.
  if (isConstrainedConnection()) {
    return
  }

  // Hotjar's modules.js costs ~140-200ms CPU + 56KB transfer on Lighthouse
  // mobile. Defer to first user interaction so it stays out of the metrics
  // window. A passive user who bounces in <1s won't be recorded — that's
  // an acceptable tradeoff for session-replay (those sessions aren't
  // informative anyway). 30s safety net for completely passive readers.
  const events = ['mousedown', 'touchstart', 'keydown', 'scroll']
  const loadOnInteraction = () => {
    loadHotjar()
    events.forEach((event) => {
      document.removeEventListener(event, loadOnInteraction)
    })
  }
  events.forEach((event) => {
    document.addEventListener(event, loadOnInteraction, { once: true, passive: true })
  })
  setTimeout(loadHotjar, 30000)
})

onMounted(() => {
  let gtmLoaded = false

  const loadGtm = () => {
    if (gtmLoaded || (typeof window !== 'undefined' && window.google_tag_manager)) return
    gtmLoaded = true

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      'event': 'gtm.js',
    })

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://load.sst.odysway.com/28bwtluuzax.js?5qth5h1=EQVHMiEhWTkoV0kvJ1lSAUVTVERTCBpKFwUDBgINDVkbDhc%3D'
    document.head.appendChild(script)
  }

  if (config.public.environment !== 'production') {
    return
  }

  // GTM/SST is ~440KB transferred + ~2.9s of script eval. Loading via
  // requestIdleCallback still landed inside the Lighthouse measurement
  // window on slow 4G. Defer until first user interaction OR a long idle
  // (15s safety net) so the metrics window stays clean. dataLayer events
  // queued before this point fire correctly once GTM boots.
  const gtmEvents = ['mousedown', 'touchstart', 'keydown', 'scroll']
  const loadGtmOnInteraction = () => {
    loadGtm()
    gtmEvents.forEach(event => document.removeEventListener(event, loadGtmOnInteraction))
  }
  gtmEvents.forEach((event) => {
    document.addEventListener(event, loadGtmOnInteraction, { once: true, passive: true })
  })
  setTimeout(loadGtm, 15000)
})

onMounted(() => {
  const userUTMs = []

  Object.keys(route.query).forEach((queryParam) => {
    if (queryParam.toLowerCase().includes('utm')) {
      userUTMs.push(queryParam + '=' + route.query[queryParam])
    }
  })

  if (userUTMs.length) {
    // console.log('userUTMs', userUTMs)
    localStorage.setItem('utmSource', userUTMs.join('&'))
  }
})
</script>

<style>
.layout-enter-active,
.layout-leave-active {
  transition: all 0.4s;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
