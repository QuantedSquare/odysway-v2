<template>
  <v-container :fluid="width < 1440">
    <v-row>
      <v-col
        cols="12"
        class="text-center text-h2 font-weight-bold mt-md-4 mb-md-12"
      >
        <slot name="title" />
      </v-col>
      <ImageTitleColCard
        v-for="category in categories"
        :key="category.id"
        :title="category.title"
        :subtitle="category.discoveryTitle"
        :image="category.image"
        :link="'/thematiques/' + category.slug"
      />
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const { data: categories } = useAsyncData('categories', () => {
  return queryCollection('categories').select('id', 'title', 'slug', 'discoveryTitle', 'image', 'showOnHome').where('showOnHome', '==', true).all()
})
console.log(categories.value)
</script>
