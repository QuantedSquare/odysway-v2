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
          type="categories"
          :description="category.discoveryTitle"
        />
      </template>
    </HorizontalCarousel>

    <v-divider thickness="2" />
    <div v-if="categoriesWithVoyages">
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
  </div>
</template>

<script setup>
const { data: categories } = useAsyncData('categories', () => {
  return queryCollection('categories').select('id', 'title', 'slug', 'discoveryTitle', 'image').all()
})

const { data: voyages } = useAsyncData('voyages', () => {
  return queryCollection('voyages').all()
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
