<template>
  <v-col
    cols="12"
    :md="colWidth"
  >
    <v-img
      :src="img(imageSrc, { format: 'webp', quality: 100, width: 1536 })"
      height="100%"
      :min-height="height"
      cover
      rounded="lg"
      :alt="alt"
    />
  </v-col>
</template>

<script setup>
defineProps({
  imageSrc: {
    type: String,
  },
  alt: {
    type: String,
    default: '',
  },
  colWidth: {
    type: String,
    default: '12',
  },
  height: {
    type: Number,
    default: 250,
  },
})

const img = useImage()
</script>
