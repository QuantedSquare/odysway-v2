<template>
  <v-container
    class="py-0 px-2 px-md-4 pt-4 pt-md-0"
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})

if (page.value) {
  console.log('page', page.value, page.value?.seo)
  useHead(page.value.head || { htmlAttrs: {
    lang: 'fr',
  } }) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
