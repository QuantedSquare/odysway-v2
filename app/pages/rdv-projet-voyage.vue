<template>
  <v-container>
    <CalContainer :travel-title="titre" />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
  pageTransition: false,
})

const { trackRdvStep } = useGtmTracking()
const titre = useRoute().query?.travelTitle || ''

useSeo({
  seoData: {
    robotsIndex: false,
    robotsFollow: false,
  },
})

useHead({
  link: [
    { rel: 'preload', as: 'script', href: 'https://app.cal.com/embed/embed.js', crossorigin: 'anonymous' },
  ],
})

// GTM: Track rdv_step0 on page load
onMounted(() => {
  trackRdvStep(0)
})
</script>
