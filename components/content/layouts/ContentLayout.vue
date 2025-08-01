<template>
  <v-container
    fluid
    class="px-2 px-md-4 pt-0 "
  >
    <SearchHeroSection
      :is-category="isCategory"
      :is-experience="isExperience"
      :is-destination="isDestination"
      :destination="displayedData?.selectedItem"
    >
      <SearchField />
    </SearchHeroSection>

    <ColorContainer
      v-if="displayedData?.items && !displayedData?.showOnBottom"
      color=""
    >
      <HorizontalCarousel
        :show-buttons="displayedData?.items.length > 4"
      >
        <template #title>
          <h3 class="custom-title">
            {{ displayedData?.pageTitle }}
          </h3>
        </template>
        <template #carousel-item>
          <ThematiqueColCard
            v-for="item in displayedData?.items"
            :key="item.id"
            :slug="item.slug"
            :image="item.image?.src || ''"
            :title="item.title"
            :description="item.discoveryTitle"
            :type="type"
          />
        </template>
      </HorizontalCarousel>
    </ColorContainer>
    <v-divider
      v-if="displayDivider && !displayedData?.showOnBottom"
      thickness="2"
      class="mt-2 mb-4 mb-md-6"
    />
    <ColorContainer color="">
      <slot name="content" />
      <template
        v-if="displayedData?.items && displayedData.showOnBottom"
      >
        <div class="mt-8">
          <HorizontalCarousel
            :show-buttons="displayedData?.items.length > 4"
          >
            <template #title>
              <h3 class="custom-title">
                {{ displayedData?.pageTitle }}
              </h3>
            </template>
            <template #carousel-item>
              <ThematiqueColCard
                v-for="item in displayedData?.items"
                :key="item.id"
                :slug="item.slug"
                :image="item.image?.src || ''"
                :title="item.title"
                :description="item.discoveryTitle"
                :type="type"
              />
            </template>
          </HorizontalCarousel>
        </div>
      </template>
    </ColorContainer>
  </v-container>
</template>

<script setup>
const props = defineProps({
  isCategory: {
    type: Boolean,
    default: false,
  },
  isExperience: {
    type: Boolean,
    default: false,
  },
  selectedCategory: {
    type: Object,
    default: () => null,
  },
  selectedExperience: {
    type: Object,
    default: () => null,
  },
  selectedDestination: {
    type: Object,
    default: () => null,
  },
  isDestination: {
    type: Boolean,
    default: false,
  },
  pageContent: {
    type: Object,
    default: () => {},
  },
  displayDivider: {
    type: Boolean,
    default: true,
  },
})
const route = useRoute()
const isComputedCategory = computed(() => !!props.isCategory)
const isComputedExperience = computed(() => !!props.isExperience)

const { data: categories } = useAsyncData('categories-on-content-layout', () => {
  if (props.isCategory) {
    return queryCollection('categories').where('showOnHome', '=', true).select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
  }
  return null
}, { watch: [isComputedCategory, isComputedExperience] })

const { data: experiences } = useAsyncData('experiences-on-content-layout', () => {
  if (props.isExperience) {
    return queryCollection('experiences').where('published', '=', true).all()
  }
  return null
}, { watch: [isComputedCategory, isComputedExperience] })

const { data: destinations } = useAsyncData('destinations-on-content-layout', () => {
  if (props.isDestination) {
    return queryCollection('destinations').where('published', '=', true).select('id', 'title', 'slug', 'metaDescription', 'image').all()
  }
  return null
})

const displayedData = computed(() => {
  if (props.isCategory) {
    const categoriesData = {
      items: categories.value,
      selectedItem: props.selectedCategory,
      pageTitle: props.pageContent?.index?.pageTitle || 'Toutes nos thématiques',
      showOnBottom: Object.keys(route.params).length > 0,
    }
    return categoriesData
  }
  if (props.isExperience) {
    const experienceData = {
      items: experiences.value,
      selectedItem: props.selectedExperience,
      pageTitle: props.pageContent?.index?.pageTitle || 'Toutes nos expériences',
      showOnBottom: Object.keys(route.params).length > 0,
    }
    return experienceData
  }
  if (props.isDestination) {
    const destinationData = {
      items: destinations.value,
      selectedItem: props.selectedDestination,
      pageTitle: props.pageContent?.index?.pageTitle || 'Toutes nos destinations',
      showOnBottom: Object.keys(route.params).length > 0,
    }
    return destinationData
  }
  return null
})

const type = computed(() => {
  if (props.isCategory) return 'thematiques'
  if (props.isExperience) return 'experiences'
  if (props.isDestination) return 'destinations'
  return null
})
</script>

<style scoped>
.custom-title {
font-weight: 700;
font-size: 50px;
line-height: 50px;
}

@media (min-width: 960px) {
  .custom-title {
    font-size: 42px !important;
    line-height: 42px !important;
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
    font-size: 30px !important;
    line-height: 30px !important;
  }
}
</style>
