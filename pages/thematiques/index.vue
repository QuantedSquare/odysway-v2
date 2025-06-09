<template>
  <ContentLayout
    :is-category="true"
  >
    <template #indexContent>
      <DisplayVoyagesRow :voyages="categoriesWithVoyages" />
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: categories } = useAsyncData('categories', () => {
  return queryCollection('categories').select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
})

const { data: voyages } = useAsyncData('voyages', () => {
  return queryCollection('voyages').where('published', '=', true).all()
})

const categoriesWithVoyages = computed(() => {
  if (!categories.value || voyages.value.length === 0) return []
  return categories.value?.map(category => ({
    ...category,
    voyages: voyages.value?.filter(voyage =>
      voyage.categories && voyage.categories?.some(c => c.name.includes(category.slug)),
    ),
  }))
})
</script>
