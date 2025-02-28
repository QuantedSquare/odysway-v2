<template>
  <div>
    <v-container>
      <v-row
        justify="center"
      >
        <v-col
          cols="12"
          class="text-dark"
        >
          <slot
            name="text"
          />
        </v-col>
        <v-col class="d-flex align-center">
          <v-avatar
            size="x-large"
            class="mr-4"
          >
            <v-img :src="img(imageSrc, { format: 'webp', quality: 70, width: 640 })" />
          </v-avatar>
          <slot name="founder" />
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
