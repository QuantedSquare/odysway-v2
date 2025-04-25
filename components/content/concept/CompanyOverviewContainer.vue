<template>
  <div>
    <v-container>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          class=""
        >
          <slot
            name="text"
          />
        </v-col>
        <v-col>
          <v-img
            :src="img(imageSrc, { format: 'webp', quality: 70, width: 1536 })"
            rounded="lg"
            class="my-8"
            cover
          />
          <slot name="capture" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    required: true,
  },
})
const img = useImage()
</script>
