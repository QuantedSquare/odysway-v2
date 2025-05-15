<template>
  <div>
    <HorizontalCarousel v-if="categories">
      <template #title>
        <slot name="title" />
      </template>
      <template #carousel-item>
        <ThematiqueColCard
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
  </div>
</template>

<script setup>
const { data: categories } = useAsyncData('categories', () => {
  return queryCollection('categories').select('id', 'title', 'slug', 'discoveryTitle', 'image', 'showOnHome').all()
})
</script>
