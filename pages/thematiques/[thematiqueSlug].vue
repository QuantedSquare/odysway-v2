<template>
  <v-container>
    <v-row>
      <SearchHeroSection
        v-if="category"
        :destination="category"
        :is-category="true"
      />
    </v-row>
    <v-row>
      <v-col
        v-for="voyage in voyages"
        :key="voyage.id"
        cols="12"
        sm="6"
        lg="4"
        xl="3"
      >
        <SearchVoyageCard
          :voyage="voyage"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.thematiqueSlug

const { data: voyages } = useAsyncData('voyages', async () => {
  const travelList = await queryCollection('voyages').all()

  return travelList.filter(v => v.categories.includes(slug))
})

const { data: category } = useAsyncData('category', async () => {
  const category = await queryCollection('categories').where('slug', '=', slug).first()
  console.log('category', category)
  return category
})

console.log('voyages', voyages.value)
</script>
