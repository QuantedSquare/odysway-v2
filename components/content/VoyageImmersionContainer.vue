<template>
  <v-container
    fluid
    class="bg-sectionBg mt-8"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        md="4"
        class="pa-10 d-flex justify-center"
      >
        <!-- <v-img
          rounded="lg"
          :src="img(imageSrc, { format: 'webp', quality: 100, height })"
        /> -->
        <FlipCard
          :front-image="img(imageSrc, { format: 'webp', quality: 100, height })"
          :back-image="img(backImg, { format: 'webp', quality: 100, height })"
          :description="`Le vrai voyage ne consiste pas à chercher de nouveaux paysages, mais à avoir de nouveaux yeux.`"
          title="`Le voyage en immersion, le partage au cœur du voyage 🌍"
        />
      </v-col>
      <v-col
        class="text-dark pa-10"
      >
        <h2 class="text-h5 text-h4 font-weight-black">
          <slot name="title" />
        </h2>
        <slot name="text" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    required: true,
    default: '/images/IMG-20240320-WA0124.jpg',
  },
  backImg: {
    type: String,
    required: true,
    default: '/images/Capture d’écran 2025-01-08 à 09.41.11',
  },
})

const { height, mobile } = useDisplay()
const img = useImage()
</script>
