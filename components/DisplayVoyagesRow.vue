<template>
  <!-- Display carousel with voyages for each type experience/category  -->
  <div v-if="availableVoyages">
    <v-row>
      <HorizontalCarousel
        v-for="content in voyages"
        v-show="content.voyages?.length > 0"
        :key="content.id"
        :slug="content.slug"
        :image="content.image.src"
        :title="content.title"
        :description="content.discoveryTitle"
      >
        <template #title>
          <h3>
            {{ content.discoveryTitle }}
          </h3>
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in content.voyages"
            :key="voyage.id"
            cols="10"
            sm="6"
            lg="4"
          >
            <!-- <v-lazy
              :min-height="228"
              :options="{ threshold: 0.5 }"
              transition="fade-transition"
            > -->
            <VoyageCard
              :voyage="voyage"
            />
            <!-- </v-lazy> -->
          </v-col>
        </template>
      </HorizontalCarousel>
    </v-row>
  </div>
  <!---------------------------------------------------------------------->

  <!-- Display search result in function of selected experience/category  -->
  <div v-if="selectedCategory || selectedExperience || isSearch">
    <v-row
      v-if="voyages && voyages.length > 0"
      class="position-relative"
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
          <CtaCardSheet v-if="voyage.isCta" />
          <VoyageCard
            v-else
            :voyage="voyage"
          />
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-row v-if="voyages && voyages.length === 0 && selectedCategory">
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h3>Aucun voyage trouvé pour thématique "{{ selectedCategory.title }}" </h3>
      </v-col>
    </v-row>
    <v-row v-if="voyages && voyages.length === 0 && selectedExperience">
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h3>Aucun voyage trouvé pour expérience "{{ selectedExperience.title }}" </h3>
      </v-col>
    </v-row>
    <v-row v-if="voyages && voyages.length === 0 && isSearch">
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h3> Modifiez vos critères de recherche </h3>
      </v-col>
    </v-row>
    <v-row
      v-if="voyages.length > 9"
      justify="center"
      align="center"
      class="flex-column my-8"
    >
      <span class="text-h6 text-secondary">Voir {{ isExpanded ? 'moins' : 'plus' }}</span>
      <BouncingBtn
        v-model="isExpanded"
        class="text-secondary"
      />
    </v-row>
  </div>
  <!---------------------------------------------------------------------->
</template>

<script setup>
const route = useRoute()
const isExpanded = ref(false)

const props = defineProps({
  selectedCategory: {
    type: Object,
  },
  selectedExperience: {
    type: Object,
  },
  isSearch: {
    type: Boolean,
    default: false,
  },
  voyages: {
    type: Object,
  },
})

const availableVoyages = computed(() => {
  if (route.name === 'experiences') {
    return props.voyages.map(experience => experience.voyages?.length).reduce((a, b) => a + b, 0) > 0
  }
  return props.voyages.length
})

const voyagesWithCta = computed(() => {
  const original = props.voyages || []
  const result = [...original]
  const cta = { id: 'cta', isCta: true }

  if (original.length >= 2) {
    result.splice(2, 0, cta)
  }
  else {
    result.push(cta)
  }

  return result
})

const limitedVoyages = computed(() => {
  if (!voyagesWithCta.value || !Array.isArray(voyagesWithCta.value)) return []
  return voyagesWithCta.value.slice(0, isExpanded.value ? voyagesWithCta.value.length : 9)
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
