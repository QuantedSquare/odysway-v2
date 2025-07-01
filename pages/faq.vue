<template>
  <v-container
    :fluid="width > 600"
    class="py-0 my-0 px-2 px-md-9"
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const route = useRoute()
const { width } = useDisplay()

definePageMeta({
  layout: 'no-faq',
})
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
if (page.value) {
  defineOgImageComponent(page.value?.ogImage?.component, {
    title: page.value.ogImage?.props.title,
    description: page.value.ogImage?.props.description,
    image: page.value.ogImage?.props.image,
    // author: page.value?.ogImage?.author,
    // twitter: page.value?.ogImage?.twitter,
  })
  useHead(page.value.head || {}) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
