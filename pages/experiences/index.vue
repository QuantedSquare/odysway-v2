<template>
  <div>
    <HorizontalCarousel v-if="categories">
      <template #title>
        <h1>Toutes nos thématiques</h1>
      </template>
      <template #carousel-item>
        <ThematiqueColCard
          v-for="category in categories"
          :key="category.id"
          :slug="category.slug"
          :image="category.image.src"
          :title="category.title"
          type="experiences"
          :description="category.discoveryTitle"
        />
      </template>
    </HorizontalCarousel>

    <v-divider thickness="2" />
    <div v-if="categoriesWithVoyages.map(category => category.voyages.length).reduce((a, b) => a + b, 0) > 0">
      <HorizontalCarousel
        v-for="category in categoriesWithVoyages"
        v-show="category.voyages.length > 0"
        :key="category.id"
        :slug="category.slug"
        :image="category.image.src"
        :title="category.title"
        :description="category.discoveryTitle"
      >
        <template #title>
          <h3>
            {{ category.discoveryTitle }}
          </h3>
        </template>
        <template #carousel-item>
          <v-col
            v-for="voyage in category.voyages"
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
      <v-col
        cols="12"
        class="text-center my-10"
      >
        <h1>Aucune voyage disponible pour le moment</h1>
      </v-col>
    </div>
  </div>
</template>

<script setup>
const { data: categories } = useAsyncData('categories', () => {
  return queryCollection('experiences').select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
})

const { data: voyages } = useAsyncData('voyages', () => {
  return queryCollection('voyages').where('published', '=', true).all()
})
const categoriesWithVoyages = computed(() => {
  if (!categories.value || !voyages.value) return []

  return categories.value.map(category => ({
    ...category,
    voyages: voyages.value.filter(voyage =>
      voyage.categories && voyage.categories.includes(category.slug),
    ),
  }))
})
</script>
