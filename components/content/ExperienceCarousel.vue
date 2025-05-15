<template>
  <div>
    <HorizontalCarousel v-if="experiences">
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
  </div>
</template>

<script setup>
const { data: experiences } = useAsyncData('experiences', () => {
  return queryCollection('experiences').select('id', 'title', 'slug', 'discoveryTitle', 'image', 'showOnHome').all()
})
</script>
