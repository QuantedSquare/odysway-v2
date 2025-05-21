<template>
  <v-container>
    <v-row>
      <ExperienceCarousel />
    </v-row>
    <v-row
      v-if="voyages.length > 0"
      class="position-relative"
    >
      <v-col
        cols="12"
        class="my-10"
      >
        <h1>Voyages trouvés: {{ voyages.length }}</h1>
      </v-col>
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
    <v-row v-if="voyages.length === 0">
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h1>Aucun voyage trouvé pour cette expérience</h1>
      </v-col>
    </v-row>
    <v-row
      v-if="voyages.length > 9"
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
  </v-container>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.experienceSlug)
const isExpanded = ref(false)

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '==', true).where('experienceType', '=', slug.value).all()
  return travelList
})

const limitedVoyages = computed(() => {
  return voyages.value.slice(0, isExpanded.value ? voyages.value.length : 9)
})
</script>

<style scoped>
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
