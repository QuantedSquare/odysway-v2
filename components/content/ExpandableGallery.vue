<template>
  <v-col cols="auto">
    <div
      v-if="status === 'pending'"
      class="image-gallery"
    >
      <v-skeleton-loader type="card" />
    </div>
    <div
      v-else-if="status === 'success'"
      class="image-gallery"
    >
      <NuxtLink
        v-for="category in categories"
        :key="category?.id"
        class="image-wrapper"
        :to="`/thematiques/${category?.slug}`"
      >
        <img
          v-if="category?.image"
          :src="category.image"
          :alt="category?.title"
        >
        <div class="blur-overlay" />
        <div class="image-overlay" />
        <div class="content-overlay">
          <h3 class="category-title text-no-wrap">{{ category?.title }}</h3>
          <p class="category-description text-no-wrap">Click to explore more about {{ category?.title }}</p>
        </div>
      </NuxtLink>
    </div>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const props = defineProps({
  categoriesSlug: {
    type: Array,
    required: true,
  },
})

const { data: categories, status } = await useAsyncData(
  `categories-${props.categoriesSlug.join('-')}`,
  async () => {
    const categoriesData = await Promise.all(
      props.categoriesSlug.map(slug =>
        queryCollection('categories')
          .where('slug', '=', slug)
          .first(),
      ),
    )
    return categoriesData
  },
  {
    server: true,
    immediate: true,
  },
)
</script>

<style scoped>
.image-gallery {
  display: flex;
  height: 24rem;
  width: 100%;
  gap: 0.5rem;
}

.image-wrapper {
  position: relative;
  display: flex;
  height: 100%;
  flex: 1;
  cursor: pointer;
  overflow: hidden;
  border-radius: 0.75rem;
  transition: all 0.5s ease-in-out;
}

.image-wrapper:hover {
  flex: 3;
}

.image-wrapper img {
  position: relative;
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: filter 0.5s ease-in-out;
}

.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  mask: linear-gradient(transparent, rgb(0, 0, 0), black);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper:hover .blur-overlay {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.752));
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem;
  color: white;
  transform: translateY(calc(100% - 5rem));
  transition: transform 0.5s ease-in-out;
  z-index: 1;
}

.image-wrapper:hover .content-overlay {
  transform: translateY(0);
}

.category-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  transition: transform 0.3s ease-in-out;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.image-wrapper:hover .category-title {
  transform: translateY(-1.5rem);
}

.category-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  opacity: 0;
  transform: translateY(1rem);
  transition: all 0.3s ease-in-out;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.image-wrapper:hover .category-description {
  opacity: 1;
  transform: translateY(0);
}
</style>
