<template>
  <v-container>
    <CalContainer :travel-title="titre" />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',

})
useSeoMeta({
  htmlAttrs: { lang: 'fr' },
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})
const titre = useRoute().query?.travelTitle || ''

useSeo({
  seoData: {
    robotsIndex: false,
    robotsFollow: false,
  },
})
</script>
