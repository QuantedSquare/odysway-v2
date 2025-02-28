<template>
  <v-col
    cols="12"
    sm="6"
  >
    <v-card
      variant="text"
      :href="blogSlug"
      height="100%"
    >
      <v-img
        :src="img(imageSrc, { format: 'webp', quality: 70, width: 640 })"
        height="100%"
        cover
      >
        <div class="position-absolute bottom-0 text-white">
          <v-card-subtitle><slot name="subtitle" /></v-card-subtitle>
          <v-card-title class="no-white-space">
            <slot name="title" />
          </v-card-title>
        </div>
      </v-img>
    </v-card>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
  blogSlug: {
    type: String,
    required: true,
  },
})
const img = useImage()
</script>
