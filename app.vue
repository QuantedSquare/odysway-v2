<template>
  <NuxtLayout>
    <!-- <NuxtPage />
    <CookiesSnackbar /> -->
    <Maintenance />
  </NuxtLayout>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const { gtag, initialize } = useGtag()

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

if (config.public.environment === 'production') {
  useHead({
    script: [
      {
        hid: 'hotjar',
        innerHTML: `(function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:6430819,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
        })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
        type: 'text/javascript',
        tagPosition: 'head',
      },
    ],
    __dangerouslyDisableSanitizersByTagID: {
      hotjar: ['innerHTML'],
    },
  })
}

onMounted(() => {
  const isConsent = localStorage.getItem('consent') === 'granted'
  if (isConsent && config.public.environment === 'production') {
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
