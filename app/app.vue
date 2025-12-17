<template>
  <NuxtLayout>
    <NuxtPage />
    <CookiesSnackbar
      v-model="consentBar"
      :opt-out="optOut"
    />
    <!-- <Maintenance /> -->
  </NuxtLayout>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const { gtag, initialize } = useGtag()
const consentBar = ref(false)
const optOut = ref(false)
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
  ],
})

// Defer Hotjar loading to improve initial page load
// if (config.public.environment === 'production') {
// Preconnect to Hotjar for faster loading when needed
useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://static.hotjar.com',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://static.hotjar.com',
    },
  ],
})

// Load Hotjar after page is interactive
onMounted(() => {
// Wait for idle time or user interaction before loading Hotjar
  const loadHotjar = () => {
    if (typeof window !== 'undefined' && !window.hj) {
      const script = document.createElement('script')
      script.innerHTML = `(function(h,o,t,j,a,r){
      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
      h._hjSettings={hjid:6430819,hjsv:6};
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
  const cookie = useCookie('odysway_employee_optout')
  optOut.value = cookie.value === 1
  const consent = localStorage.getItem('consent')
  if (consent !== 'granted') {
    setTimeout(() => {
      consentBar.value = true
    }, 100)
  }
  else {
    consentBar.value = false
  }
})
onMounted(() => {
  const isConsent = localStorage.getItem('consent') === 'granted'
  if (isConsent && config.public.environment === 'production' && !optOut.value) {
    trackPixel('track', 'PageView')
    initialize()

    gtag('consent', 'update', {
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      ad_storage: 'granted',
      analytics_storage: 'granted',
    })
    useTrackEvent('page_view')
  }

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
