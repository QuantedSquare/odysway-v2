<template>
  <v-container
    class="rounded-lg py-4 py-md-8 px-0 px-md-8 mt-4 mt-md-8 max-container-width"
    fluid
  >
    <LazyHorizontalCarousel
      v-if="experiences"
      :show-buttons="experiences.length > 4"
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
    </LazyHorizontalCarousel>
  </v-container>
</template>

<script setup>
const { data: experiences } = await useAsyncData('experiences-carousel-homepage', () => {
  return queryCollection('experiences').select('id', 'title', 'slug', 'discoveryTitle', 'image', 'showOnHome', 'published').where('published', '=', true).all()
})
</script>
