<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  console.log('route', route)
  return queryCollection('voyages').path(route.path).first()
})
if (page.value) {
  console.log('page', page.value)
  defineOgImageComponent(page.value?.ogImage?.component, {
    title: page.value.ogImage?.props.title,
    description: page.value.ogImage?.props.description,
  })
  useHead(page.value.head || {}) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
