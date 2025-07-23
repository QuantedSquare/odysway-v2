<template>
  <ContentLayout
    :is-experience="true"
    :page-content="pageContent"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="experiencesWithVoyages"
        :page-content="pageContent"
      />
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: pageContent } = await useAsyncData('page-experiences', () => {
  return queryCollection('page_experiences').first()
})

const { data: experiences } = useAsyncData('experiences', () => {
  return queryCollection('experiences').where('published', '=', true).all()
})

const { data: voyages } = useAsyncData('voyages', () => {
  return queryCollection('voyages').where('published', '=', true).all()
})

const experiencesWithVoyages = computed(() => {
  if (!experiences.value || !voyages.value) return []

  return experiences.value.map(experience => ({
    ...experience,
    voyages: voyages.value.filter(voyage =>
      voyage.experienceType.includes(experience.title),
    ),
  }))
})
</script>
