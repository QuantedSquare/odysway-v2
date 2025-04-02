<template>
  <v-container class="mt-16">
    <DestinationsDrawerContent
      :destinations="destinationsItems"
    />
    <v-row>
      test
    </v-row>
  </v-container>
</template>

<script setup>
const { data: destinationsItems } = await useAsyncData('destinations', () => queryCollection('destinations').all())
</script>
