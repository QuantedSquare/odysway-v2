<template>
  <ContentLayout :is-experience="true">
    <template #indexContent>
      <DisplayVoyagesRow :voyages="experiencesWithVoyages" />
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: experiences } = useAsyncData('experiences', () => {
  return queryCollection('experiences').all()
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
