<template>
  <v-list-item>
    <v-row
      align="center"
      justify="center"
      no-gutters
    >
      <v-col cols="auto">
        <v-img
          :src="img(imageSrc, { format: 'webp', quality: 70, width: 320 })"
          :lazy-src="img(imageSrc, { format: 'webp', quality: 10, width: 320 })"
          width="150"
          height="80"
          contain
        />
      </v-col>
      <v-col class="text-center text-lg-start">
        <slot name="text" />
      </v-col>
    </v-row>
  </v-list-item>
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
