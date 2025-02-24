<template>
  <v-list-item>
    <v-row
      align="center"
      no-gutters
    >
      <v-col cols="auto">
        <v-img
          :src="img(props.imageSrc, { format: 'webp', quality: 70 })"
          width="150"
          height="80"
          contain
        />
      </v-col>
      <v-col>
        <slot name="text" />
      </v-col>
    </v-row>
  </v-list-item>
</template>

<script setup>
import { useImage } from '#imports'

const props = defineProps({
  imageSrc: {
    type: String,
    default: '',
  },
})
const img = useImage()
</script>
