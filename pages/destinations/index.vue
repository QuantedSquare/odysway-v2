<template>
  <ContentLayout
    :is-destination="true"
    :display-divider="true"
  >
    <template #content>
      <DisplayVoyagesRow
        :voyages="destinationsWithVoyages"
      />
      <!-- <div class=" pt-md-16">
        <ContentRenderer
          v-if="page"
          :value="page"
        />
      </div> -->
    </template>
  </ContentLayout>
</template>

<script setup>
const { data: destinations } = useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '=', true).all()
})

// const page = await queryCollection('content').path('/destinations').first()
const { data: voyages } = useAsyncData('voyages-on-thematiques', () => {
  return queryCollection('voyages').where('published', '=', true).all()
})

const destinationsWithVoyages = computed(() => {
  if (!destinations.value || voyages.value?.length === 0) return []
  return destinations.value?.map(destination => ({
    ...destination,
    voyages: voyages.value?.filter(voyage =>
      voyage.destinations && voyage.destinations?.some(d => d.name?.includes(destination.title)),
    ),
  }))
})

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
})
</script>
