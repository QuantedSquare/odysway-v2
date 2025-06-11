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
const page = await queryCollection('content').path('/').first()

if (page) {
  useHead(page.head || {}) // <-- Nuxt Schema.org
  useSeoMeta(page.seo || {}) // <-- Nuxt Robots
}
</script>
