<template>
  <div
    v-if="imageSrc"
    class="container-image"
  >
    <v-img
      :src="img(imageSrc, { format: 'webp', quality: 100, width: 1024 })"
      max-height="800px"
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
