<template>
  <v-carousel-item>
    <v-img
      :src="img(props.image, { format: 'webp', quality: 100, height: 300 })"
      class="h-100"
      cover
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
})

const img = useImage()
</script>
