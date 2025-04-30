<template>
  <v-container
    fluid
  >
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </v-container>
</template>

<script setup>
definePageMeta({
  layout: 'voyage',
})
const route = useRoute()
console.log(route.path)
const [{ data: page }, { data: deal }, { data: voyagesTextes }] = await Promise.all([
  useAsyncData(route.path, () => {
    return queryCollection('voyages').path(route.path).first()
  }),
  useAsyncData('deal', () => {
    return queryCollection('deals').where('slug', '=', route.params.voyageSlug).first()
  }),
  useAsyncData('voyages-textes', () => {
    return queryCollection('page_voyage_fr').first()
  }),
])

console.log('voyages-textes', voyagesTextes.value)
if (page.value) {
  defineOgImageComponent(page.value?.ogImage?.component, {
    title: page.value.ogImage?.props.title,
    description: page.value.ogImage?.props.description,
  })
  useHead(page.value.head || {}) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}

provide('deal', deal.value)
</script>
