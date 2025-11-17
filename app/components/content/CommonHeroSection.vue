<template>
  <div
    class="hero-section rounded-xl mt-8 mt-md-0 mb-8"
  >
    <v-img
      :src="img(imageSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(imageSrc, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(imageSrc, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
      height="80vh"
      width="100%"
      alt="Image principale page à propos Odysway"
      class="rounded-xl "
      cover
    >
      <v-container
        fluid
        class="h-100 d-flex align-center"
      >
        <v-row justify="center">
          <v-col
            cols="12"
            md="auto"
          >
            <h1 class="custom-hero-title text-white text-shadow text-center">
              <slot name="title" />
            </h1>
          </v-col>
        </v-row>
      </v-container>
    </v-img>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imageSrc: {
    type: String,
    default: '/images/homeHero.jpeg',
  },
})
const img = useImage()
</script>

<style scoped>
.hero-section {
 height: 80vh;
 width: 100%;
}
.custom-hero-title {
font-weight: 700;
font-size: 78px;
line-height: 80px !important;
}

@media (max-width: 960px) {
  .hero-section {
    height: 70vh;
  }
  .custom-hero-title {
    font-size: 60px!important;
    line-height: 55px!important;
  }
}
@media (max-width: 600px) {
  .hero-section {
    height: 50vh;
  }
  .custom-hero-title {
    font-size: 34px!important;
    line-height: 40px!important;
  }
}
</style>
