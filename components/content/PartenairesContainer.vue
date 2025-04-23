<template>
  <v-container
    class="d-flex justify-center"
    fluid
  >
    <v-img
      v-for="(partenaire, key) in partenaires"
      :key="key"
      :src="img(partenaire?.imgSrc, { format: 'webp', quality: 70, height: 32, width: 320 })"
      :alt="`logo du partenaire ${partenaire.description}`"
      height="50"
      width="320"
    />
  </v-container>
</template>

<script setup>
const img = useImage()

const { data: partenaires } = await useAsyncData('partenaires', () => {
  return queryCollection('partenaires').all()
})
</script>
