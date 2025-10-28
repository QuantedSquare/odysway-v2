<template>
  <v-snackbar
    v-model="consentBar"
    :timeout="-1"
    location="left"
  >
    <v-row>
      <v-col cols="12">
        <span>
          Odysway utilise des cookies pour vous offrir une expérience utilisateur de qualité, mesurer l’audience et vous proposer des publicités personnalisées. En poursuivant votre navigation sur ce site, vous acceptez l’utilisation de cookies dans les conditions prévues par notre
          <NuxtLink
            class="text-white"
            to="/politique-de-confidentialite"
            target="_blank"
          >politique de confidentialité</NuxtLink>.</span>
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col cols="auto">
        <v-btn-secondary
          variant="outlined"
          @click="refuseCookies"
        >
          Refuser
        </v-btn-secondary>
      </v-col>
      <v-col cols="auto">
        <v-btn-secondary
          @click="acceptCookies"
        >
          Accepter
        </v-btn-secondary>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<script setup>
const consentBar = ref(true)
const { gtag, initialize } = useGtag()
const config = useRuntimeConfig()

onMounted (() => {
  if (!localStorage.getItem('consent') && config.public.environment === 'production') {
    setTimeout(() => {
      consentBar.value = true
    }, 100)
  }
  else {
    consentBar.value = false
  }
})

function acceptCookies() {
  consentBar.value = false

  initialize()
  gtag('consent', 'update', {
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    ad_storage: 'granted',
    analytics_storage: 'granted',
  })
  localStorage.setItem('consent', 'granted')
  
  // Initialize Facebook Pixel if available
  if (typeof window !== 'undefined' && window.__initFacebookPixel) {
    window.__initFacebookPixel()
  }
  
  // Small delay to ensure pixel is ready, then track
  setTimeout(() => {
    trackPixel('track', 'PageView')
  }, 100)
  useTrackEvent('page_view')
}

function refuseCookies() {
  consentBar.value = false

  gtag('consent', 'update', {
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    ad_storage: 'denied',
    analytics_storage: 'denied',
  })

  localStorage.setItem('consent', 'denied')
}

// TODO: add pixels and ga
// function activePixels() {
//   if (this.$sendinblue) { this.$sendinblue() }
//   if (this.$hotjar) { this.$hotjar() }

//   this.consentBar = false
//   this.$fb.enable()
//   this.$fb.track('PageView')
// }

// function captureOutboundLink(link) {
//   const location = route.fullPath

//   gtag('event',
//     'click',
//     {
//       event_category: 'Header Link',
//       event_label: `Header link from ${location} to ${link}`,
//     })
// }
</script>
