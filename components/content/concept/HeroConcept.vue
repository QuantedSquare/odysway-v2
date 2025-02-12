<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70, height: imageHeight, width: $vuetify.display.width })"
    :height="$vuetify.display.lgAndDown ? '70vh' : '80vh'"
    cover
  >
    <h1 class="absolute-position shadow">
      <slot
        name="title"
        mdc-unwrap="p"
      />
    </h1>
  </v-img>
</template>

<script setup>
// @Vlad: This component should not exist. It's a copy of HeroSection.vue
// The diff between HeroSection and this need to be managed in props in a single component.

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

const imageHeight = computed(() => {
  return Math.floor(height.value * 0.7)
})
</script>

<style scoped>
.absolute-position {
  font-weight: 900;
  position: absolute;
  bottom: 10%;
  left: 12%;
  font-size: 3rem;
  color: white;
}

.shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

@media screen and (max-width: 1200px) {
  .absolute-position {
    font-size: 2rem;
    top: 30%;
    left: 8%;
  }
}

@media screen and (max-width: 960px) {
  .absolute-position {
    font-size: 2rem;
    top: 30%;
    left: 5%;
  }
}
</style>
