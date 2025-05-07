<template>
  <v-container
    class="py-0 my-0"
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
  return queryCollection('content').path('/').first()
})
if (page.value) {
  defineOgImageComponent(page.value?.ogImage?.component, {
    title: page.value.ogImage?.props.title,
    description: page.value.ogImage?.props.description,
    image: page.value.ogImage?.props.image,
  })
  useHead(page.value.head || {}) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
