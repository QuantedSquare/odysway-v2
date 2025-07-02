<template>
  <ContentLayout
    :is-category="true"
    :selected-category="selectedCategory"
    :page-content="pageContent"
  >
    <template #slugContent>
      <DisplayVoyagesRow
        :selected-category="selectedCategory"
        :voyages="voyages"
        :page-content="pageContent"
      />
    </template>
    <template
      v-if="categorieContentStatus === 'success' && categorieContent"
      #blogPost
    >
      <ContentRenderer
        v-if="categorieContent"
        :value="categorieContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.thematiqueSlug)

const { data: pageContent } = await useAsyncData('page-thematiques', () => {
  return queryCollection('page_thematiques').first()
})

const { data: categories } = await useAsyncData('categories', () => {
  return queryCollection('categories').where('showOnHome', '=', true).all()
})

const selectedCategory = computed(() => {
  if (!categories.value || !slug.value) return null
  return categories.value.find(c => c.slug === slug.value) || null
})

const { data: categorieContent, status: categorieContentStatus } = useAsyncData('categorieContent', () => {
  return queryCollection('categoriesContent').where('stem', 'LIKE', `categories/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
provide('page', categorieContent)
// #TODO OPTI THE LE CALL EN FAISANT UN SELECT DES PROPS NECESSAIRES
const { data: voyages } = await useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages')
    .where('published', '=', true)
    .all()
  const test = travelList.filter(v => v.categories.some(c => c.name.includes(slug.value)))
  console.log('test', test)
  return travelList.filter(v => v.categories.some(c => c.name.includes(slug.value)))
}, {
  watch: [slug],
})
</script>
