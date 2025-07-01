<template>
  <v-container
    fluid
    class="px-2 px-md-4 pt-0 "
  >
    <SearchHeroSection
      :is-category="isCategory"
      :is-experience="isExperience"
      :is-destination="isDestination"
      :destination="selectedCategory || selectedExperience || selectedDestination"
    >
      <SearchField />
    </SearchHeroSection>

    <!-- Categories  -->
    <ColorContainer
      v-if="categories"
      color=""
    >
      <HorizontalCarousel
        :show-buttons="categories.length > 4"
      >
        <template #title>
          <h3 class="custom-title">
            {{ pageContent?.index?.pageTitle || 'Toutes nos thématiques' }}
          </h3>
        </template>
        <template #carousel-item>
          <ThematiqueColCard
            v-for="category in categories"
            :key="category.id"
            :slug="category.slug"
            :image="category.image.src"
            :title="category.title"
            type="thematiques"
            :description="category.discoveryTitle"
          />
        </template>
      </HorizontalCarousel>
    </ColorContainer>
    <!------------------>

    <!-- Experiences  -->
    <ColorContainer
      v-if="experiences"
      color=""
    >
      <HorizontalCarousel
        :show-buttons="experiences.length > 4"
      >
        <template #title>
          <h3 class="custom-title">
            {{ pageContent?.index?.pageTitle || 'Toutes nos expériences' }}
          </h3>
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
    </ColorContainer>

    <v-divider
      v-if="displayDivider"
      thickness="2"
      class="mt-2 mb-4 mb-md-6"
    />
    <ColorContainer
      color=""
    >
      <slot name="indexContent" />
      <slot name="slugContent" />
      <slot name="blogPost" />
      <CommonReviewContainer class="mt-8" />
    </ColorContainer>
  </v-container>
</template>

<script setup>
const { isCategory, isExperience, isDestination, pageContent } = defineProps({
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

const isComputedCategory = computed(() => !!isCategory)
const isComputedExperience = computed(() => !!isExperience)

const { data: categories } = useAsyncData('categories-on-content-layout', () => {
  console.log('isCategory', isCategory)
  if (isCategory) {
    return queryCollection('categories').where('showOnHome', '=', true).select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
  }
  return null
}, { watch: [isComputedCategory, isComputedExperience] })

const { data: experiences } = useAsyncData('experiences-on-content-layout', () => {
  console.log('isExperience', isExperience)
  if (isExperience) {
    return queryCollection('experiences').where('published', '=', true).all()
  }
  return null
}, { watch: [isComputedCategory, isComputedExperience] })

// const { data: destinations } = useAsyncData('destinations', () => {
//   if (isDestination && selectedDestination) {
//     return queryCollection('destinations').where('published', '=', true).select('id', 'titre', 'slug', 'metaDescription', 'image').all()
//   }
//   return null
// })
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
