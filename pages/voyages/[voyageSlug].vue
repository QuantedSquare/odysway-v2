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
console.log('route', route.params.voyageSlug)
const [{ data: page }, { data: dates }, { data: voyagesTextes }, { data: voyagesv2Data }] = await Promise.all([
  useAsyncData(route.path, () => {
    return queryCollection('voyages').path(route.path).first()
  }),
  useAsyncData('deal', () => {
    return queryCollection('dates').where('path', 'LIKE', `/dates/${route.params.voyageSlug}%`).all()
  }),
  // NEW VERSION
  useAsyncData('voyages-textes', () => {
    return queryCollection('page_voyage_fr').first()
  }),
  useAsyncData('voyagesv2', () => {
    return queryCollection('voyagesv2').where('slug', '=', route.params.voyageSlug).first()
  }),
])

if (voyagesv2Data.value) {
  console.log('voyagesv2Data', voyagesv2Data.value)
  provide('voyage', voyagesv2Data.value)
}
if (voyagesTextes.value) {
  console.log('voyages-textes', voyagesTextes.value)
  provide('page', voyagesTextes.value)
}
if (dates.value) {
  console.log('dates', dates.value)
  provide('dates', dates.value)
}

if (page.value) {
  defineOgImageComponent(page.value?.ogImage?.component, {
    title: page.value.ogImage?.props.title,
    description: page.value.ogImage?.props.description,
  })
  useHead(page.value.head || {}) // <-- Nuxt Schema.org
  useSeoMeta(page.value.seo || {}) // <-- Nuxt Robots
}
</script>
