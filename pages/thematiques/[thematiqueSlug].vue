<template>
  <v-container
    fluid
    class="px-0 px-md-7"
  >
    <v-row class="px-2 px-md-0">
      <SearchHeroSection
        v-if="categoryChoice"
        :destination="categoryChoice"
        :is-category="true"
      >
        <SearchField />
      </SearchHeroSection>
      <HorizontalCarousel
        v-if="categories && categories.length > 0"
        :show-buttons="categories.length > 4"
      >
        <template #title>
          <h3>Toutes nos thématiques</h3>
        </template>
        <template #carousel-item>
          <ThematiqueColCard
            v-for="categ in categories"
            :key="categ.id"
            :slug="categ.slug"
            :image="categ.image.src"
            :title="categ.title"
            type="thematiques"
            :description="categ.discoveryTitle"
          />
        </template>
      </HorizontalCarousel>
    </v-row>
    <v-divider
      class="my-8"
      thickness="2"
    />
    <v-row
      v-if="limitedVoyages?.length > 0"
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
          <VoyageCard
            :voyage="voyage"
          />
        </v-col>
      </TransitionGroup>
    </v-row>
    <v-row v-if="voyages?.length === 0 && slug">
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h1>Aucun voyage trouvé pour thématique "{{ categoryChoice.title }}" </h1>
      </v-col>
    </v-row>
    <v-row
      v-if="voyages?.length > 9"
      justify="center"
      align="center"
      class="flex-column my-4"
    >
      <span class="text-h6 text-secondary">Voir {{ isExpanded ? 'moins' : 'plus' }}</span>
      <BouncingBtn
        v-model="isExpanded"
        class="text-secondary"
      />
    </v-row>
    <v-container
      v-if="categorieContentStatus === 'success' && categorieContent"
      fluid
      class="mt-10 px-0"
    >
      <ContentRenderer
        v-if="categorieContent"
        :value="categorieContent"
      />
    </v-container>
  </v-container>
</template>

<script setup>
const route = useRoute()
const slug = computed(() => route.params.thematiqueSlug)
const isExpanded = ref(false)

const { data: categories } = await useAsyncData('categories', () => {
  return queryCollection('categories').where('showOnHome', '=', true).all()
})

const categoryChoice = computed(() => {
  return categories.value.find(c => c.slug === slug.value)
})

const { data: categorieContent, status: categorieContentStatus } = useAsyncData('categorieContent', () => {
  return queryCollection('categoriesContent').where('stem', 'LIKE', `categories/${slug.value}/%`).where('published', '=', true).first()
}, {
  watch: [slug],
})
provide('page', categorieContent)

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').where('published', '=', true).all()
  return travelList.filter(v => v.categories.some(c => c.name.includes(slug.value)))
})

const limitedVoyages = computed(() => {
  if (!voyages.value || !Array.isArray(voyages.value)) return []
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
