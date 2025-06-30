<template>
  <v-carousel-item>
    <v-row>
      <v-col
        cols="12"
        class="d-flex align-center ga-4"
      >
        <v-avatar
          size="x-large"
          color="primary"
        >
          <v-img
            v-show="props.photo"
            :src="img(props.photo, { format: 'webp', quality: 70, width: 640 })"
            alt="Photo de profil de l'auteur de l'avis"
          />
          <v-icon
            v-show="!props.photo"
            size="x-large"
            :icon="mdiAccount"
          />
        </v-avatar>
        <slot name="title" />
      </v-col>
      <v-col cols="12">
        <p class="text-body-1 text-grey-darken-3">
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
