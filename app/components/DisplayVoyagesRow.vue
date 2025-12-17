<template>
  <!-- Display carousel with voyages for each type experience/category  -->
  <div v-if="availableVoyages > 0">
    <HorizontalCarousel
      v-for="content in voyages"
      v-show="content.voyages?.length > 0"
      :key="content.id"
      :slug="content.slug"
      :image="content.image?.src"
      :title="content.title"
      :description="content.discoveryTitle"
    >
      <template #title>
        <h3 class="custom-title">
          {{ content.discoveryTitle || content.title }}
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
          <VoyageCardWithDates
            :voyage="voyage"
            :dates-by-slug="datesBySlug"
          />
        </v-col>
      </template>
    </HorizontalCarousel>
  </div>
  <!---------------------------------------------------------------------->

  <!-- Display search result in function of selected experience/category  -->
  <v-row
    v-if="voyages && voyages.length > 0 && (selectedCategory || selectedExperience || isSearch)"
    class="position-relative px-0 px-md-0 mx-0"
  >
    <TransitionGroup
      name="list"
    >
      <v-col
        v-for="voyage, index in displayedVoyages"
        :key="index"
        cols="12"
        sm="6"
        lg="4"
      >
        <CtaCardSheet v-if="voyage.isCta" />
        <VoyageCardWithDates
          v-else
          :voyage="voyage"
          :dates-by-slug="datesBySlug"
        />
      </v-col>
    </TransitionGroup>
  </v-row>
  <v-row
    v-if="voyages && voyages.length === 0 && selectedCategory"
    class="position-relative px-0 px-md-8 mx-0"
  >
    <v-col
      cols="12"
      class="text-center my-4 my-md-10"
    >
      <h3 class="custom-title">
        {{ noVoyagesFoundCategoryText }}
      </h3>
    </v-col>
    <v-col
      cols="12"
      sm="6"
      lg="4"
      class="mt-10"
    >
      <CtaCardSheet />
    </v-col>
  </v-row>
  <v-row
    v-if="voyages && voyages.length === 0 && selectedExperience"
    class="position-relative px-0 px-md-8 mx-0"
  >
    <v-col
      cols="12"
      class="text-center my-4 my-md-10"
    >
      <h3 class="custom-title">
        {{ noVoyagesFoundExperienceText }}
      </h3>
    </v-col>
    <v-col
      cols="12"
      sm="6"
      lg="4"
      class="mt-10"
    >
      <CtaCardSheet />
    </v-col>
  </v-row>
  <v-row
    v-if="voyages && voyages.length === 0 && isSearch"
    class="position-relative px-0 px-md-8 mx-0"
  >
    <v-col
      cols="12"
      class="text-center my-4 my-md-10"
    >
      <h3 class="custom-title">
        {{ props.pageContent?.slug?.modifySearchCriteria || 'Modifiez vos critères de recherche' }}
      </h3>
    </v-col>
    <v-col
      cols="12"
      sm="6"
      lg="4"
      class="mt-10"
    >
      <CtaCardSheet />
    </v-col>
  </v-row>
</template>

<script setup>
const route = useRoute()
// const isExpanded = ref(false)

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
    type: Array,
    default: () => [],
  },
  pageContent: {
    type: Object,
    default: () => {},
  },
})

const flattenedVoyages = computed(() => {
  if (!Array.isArray(props.voyages)) return []
  return props.voyages.flatMap((item) => {
    if (Array.isArray(item?.voyages)) return item.voyages
    return item
  }).filter(v => v && (v.slug?.current || v.slug))
})

const voyageSlugs = computed(() => [...new Set(
  flattenedVoyages.value
    .map(v => v.slug?.current || v.slug)
    .filter(Boolean),
)])

const { datesBySlug } = useTravelDates(voyageSlugs)
console.log('!! voyageSlugs', voyageSlugs.value)
console.log('!! datesBySlug', datesBySlug.value)

const availableVoyages = computed(() => {
  if (route.name === 'experiences') {
    return props.voyages.map(experience => experience.voyages?.length).reduce((a, b) => a + b, 0) > 0
  }
  return props.voyages?.length || 0
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

const displayedVoyages = computed(() => {
  if (!voyagesWithCta.value || !Array.isArray(voyagesWithCta.value)) return []
  // return voyagesWithCta.value.slice(0, isExpanded.value ? voyagesWithCta.value.length : 9)
  return voyagesWithCta.value
})

const noVoyagesFoundCategoryText = computed(() => {
  if (props.pageContent?.slug?.noVoyagesFound && props.selectedCategory?.title) {
    return props.pageContent.slug.noVoyagesFound.replace('{{title}}', props.selectedCategory.title)
  }
  return `Aucun voyage trouvé pour la thématique "${props.selectedCategory?.title || ''}"`
})

const noVoyagesFoundExperienceText = computed(() => {
  if (props.pageContent?.slug?.noVoyagesFound && props.selectedExperience?.title) {
    return props.pageContent.slug.noVoyagesFound.replace('{{title}}', props.selectedExperience.title)
  }
  return `Aucun voyage trouvé pour l'expérience "${props.selectedExperience?.title || ''}"`
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
.custom-title {
font-weight: 700;
font-size: 50px;
line-height: 50px;
}

@media (min-width: 960px) {
  .custom-title {
    font-size: 42px!important;
    line-height: 42px!important;
  }
}

@media (max-width: 960px) {
  .custom-title {
    font-size: 42px !important;
    line-height: 42px !important;
  }
}
@media (max-width: 400px) {
  .custom-title {
    font-size: 24px !important;
    line-height: 30px !important;
  }
}
</style>
