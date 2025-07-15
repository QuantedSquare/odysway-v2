<template>
  <ContentLayout
    :is-category="true"
    :page-content="pageContent"
  >
    <template #indexContent>
      <DisplayVoyagesRow
        :voyages="categoriesWithVoyages"
        :page-content="pageContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: pageContent } = await useAsyncData('page-thematiques', () => {
  return queryCollection('page_thematiques').first()
})

const { data: categories } = useAsyncData('categories', () => {
  return queryCollection('categories').select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
})

const { data: voyages } = useAsyncData('voyages-on-thematiques', () => {
  return queryCollection('voyages').where('published', '=', true).all()
})

const categoriesWithVoyages = computed(() => {
  if (!categories.value || voyages.value?.length === 0) return []
  return categories.value?.map(category => ({
    ...category,
    voyages: voyages.value?.filter(voyage =>
      voyage.categories && voyage.categories?.some(c => c.name?.includes(category.slug)),
    ),
  }))
})

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
