<template>
  <div class="relative-hero-section mb-4 rounded-xl">
    <v-img
      :src="img(imageSrc, { format: 'webp', quality: 70, height: 900, width: 1536 })"
      :lazy-src="img(imageSrc, { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(imageSrc, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(imageSrc, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
      height="80vh"
      alt="Image principale page concept Odysway"
      class="rounded-xl "
      cover
    >
      <div class="h-100 d-flex align-center position-relative">
        <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
          <v-row
            justify="center"
            align="center"
          >
            <v-col
              cols="12"
              md="auto"
            >
              <h1 class="custom-hero-title">
                <slot name="title" />
              </h1>
            </v-col>
          </v-row>
        </v-container>
      </div>
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
.relative-hero-section {
 position:relative;
 height: 80vh;
 width: 100%;
}

@media (max-width: 960px) {
  .relative-hero-section {
    height: 70vh;
  }
  .custom-hero-title {
    font-size: 48px!important;
    line-height: 42px!important;
  }
}
.custom-hero-title {
font-weight: 700;
font-size: 78px;
line-height: 80px;
}
</style>
