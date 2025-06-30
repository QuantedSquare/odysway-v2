<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>

<script setup>
const route = useRoute()

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
  useHead(page.value.head || { htmlAttrs: { lang: 'fr' } }) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
