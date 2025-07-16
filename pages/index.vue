<template>
  <v-container
    class="py-0 my-0 px-2 px-md-4"
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
const { data: page } = await useAsyncData('homepage', () => queryCollection('content').path('/').first())

if (page.value) {
  useHead(page.value.head || { htmlAttrs: {
    lang: 'fr',
  } }) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
