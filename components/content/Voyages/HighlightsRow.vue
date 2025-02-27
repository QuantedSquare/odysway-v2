<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        sm="5"
      >
        <v-img
          :src="img(props.image, { format: 'webp', quality: 70 })"
          rounded="lg"
          min-height="340px"
          max-height="500px"
          cover
        />
      </v-col>
      <v-col
        cols="12"
        sm="7"
        class="d-flex flex-column justify-lg-center"
      >
        <v-card variant="text">
          <v-card-title class="">
            <slot name="title" />
          </v-card-title>
          <v-card-text>
            <v-list slim>
              <slot />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
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
