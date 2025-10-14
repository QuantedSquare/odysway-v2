<template>
  <div v-if="page">
    <h1>{{ page.title }}</h1>
    <SanityContent :blocks="page.body" />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const sanity = useSanity()

const privacyPolicyQuery = groq`*[_type == "privacyPolicy" && slug.current == "politique-de-confidentialite"][0]{
  title,
  body
}`

const { data: page } = await useAsyncData('politique-de-confidentialite', () =>
  sanity.fetch(privacyPolicyQuery)
)
</script>
