<template>
  <div
    v-if="imageSrc"
    class="container-image"
  >
    <NuxtLink
      v-if="link"
      :to="link"
    >
      <v-img
        :src="img(imageSrc, { format: 'webp', quality: 100, width: 1024 })"
        max-height="800px"
        :alt="alt"
        width="100%"
        cover
        class="custom-image"
        rounded="xl"
      />
    </NuxtLink>
    <v-img
      v-else
      :src="img(imageSrc, { format: 'webp', quality: 100, width: 1024 })"
      max-height="800px"
      :alt="alt"
      width="100%"
      cover
      class="custom-image"
      rounded="xl"
    />
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  link: {
    type: String || null,
    default: null,
  },
})

const img = useImage()
</script>

<style scoped>
.container-image {
  margin-bottom: 1.5rem;
}

.container-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}
</style>
