<template>
  <ContentLayout
    :is-category="true"
    :selected-category="selectedCategory"
    :page-content="pageContent"
  >
    <template #content>
      <DisplayVoyagesRow
        :selected-category="selectedCategory"
        :voyages="voyages"
        :page-content="pageContent"
      />
      <template
        v-if="categorieContentStatus === 'success' && categorieContent"
      >
        <ContentRenderer
          v-if="categorieContent"
          :value="categorieContent"
          class="mt-8"
        />
      </template>
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

const { data: categorieContent, status: categorieContentStatus } = useAsyncData('categorieContent', async () => {
  const categJSON = await queryCollection('categories').where('slug', '=', slug.value).first()
  const pathParts = categJSON.stem.split('/')
  const categoryPath = pathParts.slice(0, 2).join('/')
  const result = await queryCollection('categoriesContent').where('stem', 'LIKE', `${categoryPath}/%`).where('published', '=', true).first()
  return result
}, {
  watch: [slug],
})

provide('page', categorieContent)
// #TODO OPTI THE LE CALL EN FAISANT UN SELECT DES PROPS NECESSAIRES
const { data: voyages } = await useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages')
    .where('published', '=', true)
    .all()

  return travelList.filter(v => v.categories?.some(c => c.name?.includes(slug.value)))
}, {
  watch: [slug],
  immediate: true,
})

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
