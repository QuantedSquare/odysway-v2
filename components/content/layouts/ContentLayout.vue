<template>
  <v-container
    fluid
    class="px-2 px-md-4 pt-0 "
  >
    <SearchHeroSection
      :is-category="type === 'thematiques'"
      :is-experience="type === 'experiences'"
      :is-destination="type === 'destinations'"
      :destination="displayedData?.selectedItem"
      :page-content="pageContent"
    >
      <SearchField />
    </SearchHeroSection>

    <ColorContainer color="">
      <slot name="content" />
      <template
        v-if="displayedData?.items"
      >
        <div class="mt-8">
          <v-divider
            v-if="displayDivider && !displayedData?.showOnBottom"
            thickness="2"
            class="mt-2 mb-4 mb-md-6"
          />
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
                :image="item.image"
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
const { displayedData, pageContent } = defineProps({
  type: {
    type: String,
    default: null,
  },
  displayedData: {
    type: Object,
    default: () => null,
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
  pageContent: {
    type: Object,
    default: null,
  },
  displayDivider: {
    type: Boolean,
    default: true,
  },
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
