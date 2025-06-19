<template>
  <ContentLayout
    :is-experience="true"
    :selected-experience="selectedExperience"
  >
    <template #slugContent>
      <DisplayVoyagesRow
        :selected-experience="selectedExperience"
        :voyages="filteredVoyages"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.experienceSlug)

const { data: experiences } = await useAsyncData('experiences', () => {
  return queryCollection('experiences').all()
})

const selectedExperience = computed(() => {
  return experiences.value.find(e => e.slug === slug.value)
})

const { data: filteredVoyages } = await useAsyncData('filtered-voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '==', true).where('experienceType', '=', selectedExperience.value.title).all()
  return travelList
})
</script>
