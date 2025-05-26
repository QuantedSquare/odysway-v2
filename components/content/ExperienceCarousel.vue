<template>
  <v-container
    class="rounded-lg"
  >
    <HorizontalCarousel
      v-if="experiences"
      :show-buttons="experiences.length > 4 || smAndDown"
    >
      <template #title>
        <slot name="title" />
      </template>
      <template #carousel-item>
        <ThematiqueColCard
          v-for="experience in experiences"
          v-show="experience.showOnHome"
          :key="experience.id"
          :slug="experience.slug"
          :image="experience.image.src"
          :title="experience.title"
          :description="experience.discoveryTitle"
          type="experiences"
        />
      </template>
    </HorizontalCarousel>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { data: experiences } = await useAsyncData('experiences', () => {
  return queryCollection('experiences').select('id', 'title', 'slug', 'discoveryTitle', 'image', 'showOnHome').all()
})

const { smAndDown } = useDisplay()
</script>
