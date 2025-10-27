<template>
  <div>
    <SectionContainer>
      <template #content>
        <h1 v-if="page">
          {{ page.title }}
        </h1>
        <EnrichedText
          :value="page.body"
        />
      </template>
    </SectionContainer>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'simple-pages',
})

const sanity = useSanity()

const query = groq`*[_type == "conditionsGeneralesVente" && slug.current == "conditions-generales-de-vente"][0]{
  title,
  body,
  seo
}`

const { data: page } = await useAsyncData('conditions-generales-de-vente', () =>
  sanity.fetch(query),
)

if (page.value) {
  useSeo({
    seoData: page.value?.seo,
    content: page.value,
    pageType: 'website',
    slug: 'conditions-generales-de-vente',
    baseUrl: '/conditions-generales-de-vente',
  })
}
</script>
