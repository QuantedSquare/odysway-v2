<template>
  <v-parallax
    :src="img(imageSrc, { format: 'webp', quality: 70, height })"
    height="100vh"
    cover
  >
    <span class="absolute-position shadow px-6">
      <slot
        name="title"
      />
      <slot />
    </span>
  </v-parallax>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})
const img = useImage()
const { height } = useDisplay()
</script>

<style scoped>
.absolute-position {
  font-weight: 700;
  position: absolute;
  bottom: 20%;
  left: 10%;
  font-size: 5rem;
  color: white;
}

.shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

@media screen and (max-width: 600px) {
  .absolute-position {
    font-size: 3rem;
    left:0;
    width: 100%;
  }
}

@media screen and (max-width: 400px) {
  .absolute-position {
    font-size: 2rem;
    left: 2%;
  }
}
</style>
