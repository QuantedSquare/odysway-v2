<template>
  <v-container
    fluid
    class="bg-sectionBg mt-8"
  >
    <v-row
      align="center"
      justify-md="center"
    >
      <v-col
        cols="12"
        md="8"
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="4"
            class="d-none d-lg-flex"
          >
            <v-img
              rounded="lg"
              :src="img(imageSrc, { format: 'webp', quality: 100, height })"
            />
          </v-col>
          <v-col class="text-textColor">
            <h2 class="my-6 text-h5 text-h4 font-weight-black">
              <slot name="title" />
            </h2>
            <slot name="text" />
          </v-col>
        </v-row>
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
})

const { height, width } = useDisplay()
const img = useImage()
</script>
