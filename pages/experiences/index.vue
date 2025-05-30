<template>
  <v-container>
    <HorizontalCarousel v-if="experiences">
      <template #title>
        <h1>Toutes nos expériences</h1>
      </template>
      <template #carousel-item>
        <ThematiqueColCard
          v-for="experience in experiences"
          :key="experience.id"
          :slug="experience.slug"
          :image="experience.image.src"
          :title="experience.title"
          type="experiences"
          :description="experience.discoveryTitle"
        />
      </template>
    </HorizontalCarousel>

    <v-divider
      class="my-4"
      thickness="2"
    />
    <div v-if="availableVoyages">
      <HorizontalCarousel
        v-for="experience in experiencesWithVoyages"
        v-show="experience.voyages.length > 0"
        :key="experience.id"
        :slug="experience.slug"
        :image="experience.image.src"
        :title="experience.title"
        :description="experience.discoveryTitle"
      >
        <template #title>
          <h3>
            {{ experience.discoveryTitle }}
          </h3>
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in experience.voyages"
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
    <div v-else>
      <v-row>
        <v-col
          cols="12"
          class="text-center my-10"
        >
          <h1>Aucun voyage disponible pour le moment</h1>
        </v-col>
      </v-row>
    </div>
  </v-container>
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

const availableVoyages = computed(() => {
  return experiencesWithVoyages.value.map(experience => experience.voyages.length).reduce((a, b) => a + b, 0) > 0
})
</script>
