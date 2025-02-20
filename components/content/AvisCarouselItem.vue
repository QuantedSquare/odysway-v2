<template>
  <v-carousel-item>
    <v-row>
      <v-col
        cols="12"
        class="d-flex align-center"
      >
        <v-avatar
          size="60"
          class="mr-4"
          color="primary"
        >
          <v-img
            v-show="props.photo"
            :src="img(props.photo, { format: 'webp', quality: 70 })"
          />
          <v-icon
            v-show="!props.photo"
            size="50"
            color="white"
            :icon="mdiAccount"
          />
        </v-avatar>
        <slot name="title" />
      </v-col>
      <v-col cols="12">
        <p class="text-grey-darken-2">
          <slot
            name="avis"
            mdc-unwrap="p"
          />
        </p>
      </v-col>
    </v-row>
  </v-carousel-item>
</template>

<script setup>
import { mdiAccount } from '@mdi/js'
import { useImage } from '#imports'

const props = defineProps({
  image: {
    type: String,
    default: '',
  },
  photo: {
    type: String,
    deafult: '',
  },
})

const img = useImage()
</script>
