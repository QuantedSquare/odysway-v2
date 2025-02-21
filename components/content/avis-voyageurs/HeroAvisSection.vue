<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70 })"
    :height="$vuetify.display.sm ? '70vh' : '80vh'"
    cover
  >
    <span class="absolute-position text-shadow">
      <slot
        name="title"
      />
    </span>
  </v-img>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})

const img = useImage()
</script>

<style scoped>
.absolute-position {
  font-weight: 700;
  position: absolute;
  bottom: 10%;
  left: 10%;
  font-size: 5rem;
  color: white;
}

@media screen and (max-width: 600px) {
  .absolute-position {
    font-size: 3rem;
    top: 30%;
    left: 5%;
  }
}

@media screen and (max-width: 400px) {
  .absolute-position {
    font-size: 2rem;
    left: 2%;
  }
}
</style>
