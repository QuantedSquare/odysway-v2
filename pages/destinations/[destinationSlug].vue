<template>
  <v-container>
    <v-row>
      <SearchHeroSection
        v-if="destinations"
        :destination="destinations"
      />
    </v-row>
    <v-row
      v-if="voyages.length > 0"
      class="relative"
    >
      <TransitionGroup
        name="list"
      >
        <v-col
          v-for="voyage in limitedVoyages"
          :key="voyage.id"
          cols="12"
          sm="6"
          lg="4"
          xl="3"
        >
          <SearchVoyageCard
            :voyage="voyage"
          />
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-row v-if="limitedVoyages.length === 0">
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h1>Aucun voyage trouvé pour cette destination</h1>
      </v-col>
    </v-row>
    <v-row
      v-if="limitedVoyages.length > 9"
      justify="center"
      align="center"
      class="flex-column my-10"
    >
      <span class="text-h6 text-secondary">Voir {{ isExpanded ? 'moins' : 'plus' }}</span>
      <BouncingBtn
        v-model="isExpanded"
        class="text-secondary"
      />
    </v-row>

    <v-row v-if="destinationsContentStatus === 'success' && destinationsContent">
      <ContentRenderer
        v-if="destinationsContent"
        :value="destinationsContent"
      />
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.destinationSlug)
const isExpanded = ref(false)

const { data: destinations } = useAsyncData('destinations', () => {
  return queryCollection('destinations').where('stem', 'LIKE', `destinations/${slug.value}/%`).where('published', '=', true).first()
})
console.log('destinations', destinations.value)
const { data: destinationsContent, status: destinationsContentStatus } = useAsyncData('categorieContent', () => {
  return queryCollection('destinationsContent').where('stem', 'LIKE', `destinations/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
console.log('destinationsContent', destinationsContent.value)
provide('page', destinationsContent)

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '=', true).all()
  console.log('travelList', destinations.value)
  return travelList.filter(v => v.destinations.some(d => d.name.includes(destinations.value?.titre)))
}, {
  watch: [destinations],
})

const limitedVoyages = computed(() => {
  return voyages.value.slice(0, isExpanded.value ? voyages.value.length : 9)
})

// console.log('voyages', voyages.value)
</script>

<style scoped>
.relative {
  position: relative;
}

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to{
  opacity: 0;
  transform: translateY(-30px);
}
/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
