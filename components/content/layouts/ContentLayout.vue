<template>
  <v-container
    fluid
    class="px-3"
  >
    <SearchHeroSection
      :is-category="isCategory"
      :is-experience="isExperience"
      :destination="selectedCategory || selectedExperience"
    >
      <SearchField />
    </SearchHeroSection>

    <!-- Categories  -->
    <HorizontalCarousel
      v-if="categories"
      :show-buttons="categories.length > 4"
    >
      <template #title>
        <h3>Toutes nos thématiques</h3>
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
    <!------------------>

    <!-- Experiences  -->
    <HorizontalCarousel
      v-if="experiences"
      :show-buttons="experiences.length > 4"
    >
      <template #title>
        <h3>Toutes nos expériences</h3>
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
    <!------------------>

    <v-divider
      thickness="2"
      class="my-8"
    />

    <slot name="indexContent" />
    <slot name="slugContent" />
    <slot name="blogPost" />
  </v-container>
</template>

<script setup>
const { isCategory, isExperience } = defineProps({
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
  },
  selectedExperience: {
    type: Object,
  },
})

const { data: categories } = useAsyncData('categories', () => {
  if (isCategory) {
    return queryCollection('categories').where('showOnHome', '=', true).select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
  }
  return null
})

const { data: experiences } = useAsyncData('experiences', () => {
  if (isExperience) {
    return queryCollection('experiences').all()
  }
  return null
})
</script>
