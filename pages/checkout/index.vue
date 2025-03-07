<template>
  <v-container
    fluid
    class="mt-10 relative"
  >
    <v-img
      :src="img(imageSrc, { format: 'webp', quality: 70, height: 900 })"
      :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(imageSrc, { format: 'webp', quality: 70, width: 600 })} 480w, ${img(imageSrc, { format: 'webp', quality: 70, width: 900 })} 1500w`"
      height="350px"
      cover
      class="absolute"
    />
    <v-row
      justify="center"
    >
      <FunnelCheckoutStepper />
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const imageSrc = ref('/images/Laponie-(1).webp')
const img = useImage()
</script>

<style scoped>
.relative {
  position: relative;
}
.absolute {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
