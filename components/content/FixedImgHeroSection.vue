<template>
  <div>
    <v-img
      class="img-couv hidden-md-and-down"
      :src="img(imgSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
    />
    <v-img
      class="img-couv hidden-md-and-up"
      :src="img(imgSrcMobile, { format: 'webp', quality: 70, height: 900, width: 1536 })"
    />
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imgSrc: {
    type: String,
    required: true,
  },
  imgSrcMobile: {
    type: String,
    required: true,
  },
})
const img = useImage()
</script>
