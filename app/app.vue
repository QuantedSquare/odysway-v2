<template>
  <NuxtLayout>
    <NuxtPage />
    <ClientOnly>
      <CookiesSnackbar />
    </ClientOnly>
    <SearchDialog />
    <!-- <Maintenance /> -->
  </NuxtLayout>
</template>

<script setup>
// import './assets/css/main.css'
import '../app/assets/scss/main.scss'

const config = useRuntimeConfig()
const route = useRoute()

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
  link: [
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/subset-Gordita-Medium.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
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
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/subset-Gordita-MediumItalic.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
    {
      rel: 'preload',
      href: '/fonts/Gordita-Font/subset-Gordita-BoldItalic.woff2',
      as: 'font',
      crossorigin: '',
      type: 'font/woff2',
    },
  ],
})

// Hotjar is loaded lazily via requestIdleCallback — no preconnect needed

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

  // Load after a short delay or on user interaction
  if (config.public.environment !== 'production') {
    return
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadHotjar, { timeout: 2000 })
  }
  else {
    setTimeout(loadHotjar, 2000)
  }

  // Also load on first user interaction as fallback
  const events = ['mousedown', 'touchstart', 'keydown']
  const loadOnInteraction = () => {
    loadHotjar()
    events.forEach((event) => {
      document.removeEventListener(event, loadOnInteraction)
    })
  }
  events.forEach((event) => {
    document.addEventListener(event, loadOnInteraction, { once: true, passive: true })
  })
})

onMounted(() => {
  let gtmLoaded = false

  const loadGtm = () => {
    console.log('Loading...')
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

  // if (config.public.environment !== 'production') {
  //   return
  // }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadGtm, { timeout: 1000 })
  }
  else {
    setTimeout(loadGtm, 1000)
  }

  const gtmEvents = ['mousedown', 'touchstart', 'keydown']
  const loadGtmOnInteraction = () => {
    loadGtm()
    gtmEvents.forEach(event => document.removeEventListener(event, loadGtmOnInteraction))
  }
  gtmEvents.forEach((event) => {
    document.addEventListener(event, loadGtmOnInteraction, { once: true, passive: true })
  })
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
