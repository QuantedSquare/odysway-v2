<template>
  <v-container>
    <v-row justify="center">
      <v-col
        cols="12"
        md="10"
        xl="8"
      >
        <v-row>
          <v-col
            cols="12"
          >
            <h2><slot name="title" /></h2>
          </v-col>
          <v-col
            cols="12"
            class="text-center"
          >
            <h3><slot name="subtitle" /></h3>
          </v-col>
          <v-col cols="12">
            <v-img
              :src="img(imageSrc, { format: 'webp', quality: 100, width: 1024 })"
              max-height="800px"
              width="100%"
              cover
              rounded="xl"
            />
          </v-col>
          <v-col cols="12">
            <slot name="text" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()

defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
})
</script>
