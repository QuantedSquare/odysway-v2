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
          :max-height="$vuetify.display.lg ? '500' : '' "
          cover
        />
      </v-col>
      <v-col
        cols="12"
        sm="7"
      >
        <v-card variant="text">
          <v-card-title class="pl-0 pt-0">
            <slot name="title" />
          </v-card-title>

          <v-list>
            <slot name="items" />
          </v-list>
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
