<template>
  <v-container>
    <CalendlyContainer :travel-title="titre" />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})
const titre = useRoute().query?.travelTitle || ''
</script>
