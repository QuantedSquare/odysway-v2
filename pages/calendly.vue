<template>
  <v-container class="mt-16">
    <CalendlyContainer :travel-title="titre" />
  </v-container>
</template>

<script setup>
const titre = useRoute().query?.travelTitle || ''
</script>
