<template>
  <ContentLayout
    :is-category="true"
    :selected-category="selectedCategory"
  >
    <template #slugContent>
      <DisplayVoyagesRow
        :selected-category="selectedCategory"
        :voyages="voyages"
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

const { data: categories } = await useAsyncData('categories', () => {
  return queryCollection('categories').where('showOnHome', '=', true).all()
})

const selectedCategory = computed(() => {
  return categories.value.find(c => c.slug === slug.value)
})

const { data: categorieContent, status: categorieContentStatus } = useAsyncData('categorieContent', () => {
  return queryCollection('categoriesContent').where('stem', 'LIKE', `categories/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
provide('page', categorieContent) // CHEKC : utilisé ?

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '=', true).all()
  return travelList.filter(v => v.categories.some(c => c.name.includes(slug.value)))
})
</script>
