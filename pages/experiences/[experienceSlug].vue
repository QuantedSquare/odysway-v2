<template>
  <ContentLayout
    :is-experience="true"
    :selected-experience="selectedExperience"
    :page-content="pageContent"
  >
    <template #slugContent>
      <DisplayVoyagesRow
        :selected-experience="selectedExperience"
        :voyages="voyages"
        :page-content="pageContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.experienceSlug)

const { data: pageContent } = await useAsyncData('page-experiences', () => {
  return queryCollection('page_experiences').first()
})

const { data: experiences } = await useAsyncData('experiences', () => {
  return queryCollection('experiences').where('published', '=', true).all()
})

const selectedExperience = computed(() => {
  if (!experiences.value || !slug.value) return null
  return experiences.value.find(e => e.slug === slug.value) || null
})

const { data: voyages } = await useAsyncData('voyages', async () => {
  if (!selectedExperience.value?.title) return []
  const travelList = await queryCollection('voyages').where('published', '=', true).where('experienceType', '=', selectedExperience.value.title).all()
  return travelList
}, {
  watch: [slug],
})
</script>
