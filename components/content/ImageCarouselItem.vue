<template>
  <v-carousel-item>
    <v-img
      :src="img(props.image, { format: 'webp', quality: 100, width: 1536 })"
      class="h-100"
      rounded="lg"
      cover
      :alt="alt || `Image du carrousel ${props.image}`"
    />
  </v-carousel-item>
</template>

<script setup>
import { useImage } from '#imports'

const props = defineProps({
  image: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
})

const img = useImage()
</script>
