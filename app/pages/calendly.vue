<template>
  <v-container>
    <CalendlyContainer :travel-title="titre" />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})

const { trackRdvStep } = useGtmTracking()
const titre = useRoute().query?.travelTitle || ''

useSeo({
  seoData: {
    robotsIndex: false,
    robotsFollow: false,
  },
})

// GTM: Track rdv_step0 on page load
onMounted(() => {
  trackRdvStep(0)
})
</script>
