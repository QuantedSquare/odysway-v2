<template>
  <v-img
    :src="img(imageSrc, { format: 'webp', quality: 70 })"
    height="70vh"
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
  font-weight: 900;
  position: absolute;
  bottom: 10%;
  left: 10%;
  font-size: 3rem;
  color: white;
}

.shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

@media screen and (max-width: 600px) {
  .absolute-position {
    font-size: 2rem;
    top: 30%;
    left: 5%;
  }
}
</style>
