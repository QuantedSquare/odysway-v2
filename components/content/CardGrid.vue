<template>
  <v-container
    fluid
    class="pa-0 mx-0 "
  >
    <v-container
      v-if="width > 960"
      fluid
    >
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
    <HorizontalCarousel
      v-else
      :center-title="true"
    >
      <template #title>
        <slot name="title" />
      </template>
      <template #carousel-item>
        <CategColCard
          v-for="category in categories"
          v-show="category.showOnHome"
          :key="category.id"
          :slug="category.slug"
          :image="category.image.src"
          :title="category.title"
          :description="category.discoveryTitle"
          type="thematiques"
        />
      </template>
    </HorizontalCarousel>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const { data: categories } = await useAsyncData('categories-card-grid', () => {
  return queryCollection('categories').select('id', 'title', 'slug', 'discoveryTitle', 'image', 'showOnHome').where('showOnHome', '=', true).all()
})
</script>
