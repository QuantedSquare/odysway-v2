<template>
  <v-container>
    <CalendlyContainer :travel-title="titre" />
  </v-container>
</template>

<script setup>
const titre = useRoute().query?.travelTitle || ''
</script>
