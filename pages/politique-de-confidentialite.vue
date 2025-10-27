<template>
  <div v-if="page">
    <SectionContainer>
      <template #content>
        <h1 class="text-center  font-weight-bold">
          {{ page.title }}
        </h1>
        <EnrichedText :value="page.body" />
      </template>
    </SectionContainer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const sanity = useSanity()

const privacyPolicyQuery = groq`*[_type == "privacyPolicy" && slug.current == "politique-de-confidentialite"][0]{
  title,
  body,
  seo
}`

const { data: page } = await useAsyncData('politique-de-confidentialite', () =>
  sanity.fetch(privacyPolicyQuery),
)

if (page.value) {
  useSeo({
    seoData: page.value?.seo,
    content: page.value,
    pageType: 'website',
    slug: 'politique-de-confidentialite',
    baseUrl: '/politique-de-confidentialite',
  })
}
</script>
