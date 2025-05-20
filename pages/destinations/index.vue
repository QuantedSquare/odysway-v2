<template>
  <div>
    <HorizontalCarousel v-if="destinations">
      <template #title>
        <h1>Toutes nos destinations</h1>
      </template>
      <template #carousel-item>
        <ThematiqueColCard
          v-for="destination in destinations"
          :key="destination.id"
          :slug="destination.slug"
          :image="destination.image.src"
          :title="destination.titre"
          type="destinations"
          :description="destination.discoveryTitle"
        />
      </template>
    </HorizontalCarousel>

    <v-divider thickness="2" />
    <div v-if="destinationsWithVoyages">
      <HorizontalCarousel
        v-for="destination in destinationsWithVoyages"
        v-show="destination.voyages.length > 0"
        :key="destination.id"
        :slug="destination.slug"
        :image="destination.image.src"
        :title="destination.titre"
        :description="destination.titre"
      >
        <template #title>
          <NuxtLink
            :to="`/destinations/${destination.slug}`"
            class="text-primary"
          >
            <h3 class="text-primary ">
              {{ destination.titre }}
            </h3>
          </NuxtLink>
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in destination.voyages"
            :key="voyage.id"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-lazy
              :min-height="228"
              :options="{ threshold: 0.5 }"
              transition="fade-transition"
            >
              <SearchVoyageCard
                :voyage="voyage"
              />
            </v-lazy>
          </v-col>
        </template>
      </HorizontalCarousel>
    </div>
  </div>
</template>

<script setup>
const { data: destinations } = useAsyncData('destinations', () => {
  return queryCollection('destinations').where('published', '==', true).all()
})
console.log(destinations.value)
const { data: voyages } = useAsyncData('voyages', () => {
  return queryCollection('voyages').where('published', '==', true).all()
})
const destinationsWithVoyages = computed(() => {
  if (!destinations.value || !voyages.value) return []

  return destinations.value?.map(destination => ({
    ...destination,
    voyages: voyages.value.filter(voyage =>
      voyage.destinations && voyage.destinations.some(d => d.name.includes(destination.titre)),
    ),
  }))
})
</script>
