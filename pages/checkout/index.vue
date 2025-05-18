<template>
  <v-container
    fluid
    class="relative"
  >
    <v-img
      v-if="travel"
      :src="img(travel.image.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      :lazy-src="img(travel.image.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(travel.image.src, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(travel.image.src, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
      :alt="travel.image.alt"
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

definePageMeta({
  layout: 'funnel',
})
useSeoMeta({
  robots: 'noindex, follow',
  canonical: 'https://www.odysway.com/',
})

const route = useRoute()

const travel = await queryCollection('voyages').where('slug', '=', route.query.slug).first()

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
