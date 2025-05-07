<template>
  <v-container
    fluid
    class="relative-hero-section mb-16 rounded-md bg-primary d-flex align-center"
  >
    <v-row>
      <v-col
        cols="4"
        class="d-flex align-center"
      >
        <h1 class="custom-hero-title">
          ADD TEXT HERE
        </h1>
      </v-col>
      <v-col
        cols="8"
      >
        <v-img
          :src="img('/images/homeHero.jpeg', { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img('/images/homeHero.jpeg', { format: 'webp', quality: 10, height: 900, width: 1536 })"
          size="(max-width: 600) 480px, 1500px"
          :srcset="`${img('/images/homeHero.jpeg', { format: 'webp', quality: 70, width: 640 })} 480w, ${img('/images/homeHero.jpeg', { format: 'webp', quality: 70, width: 1024 })} 1500w`"
          height="302"
          class="rounded-md"
          cover
        />
      </v-col>
    </v-row>

    <div class="absolute">
      <slot />
    </div>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
</script>

<style scoped>
.relative-hero-section {
 position:relative;
 height: 348px;
}
.absolute {
  position: absolute;
  left:0;
  right: 0;
  bottom: -60px;
}

@media (max-width: 960px) {
    .absolute {
    bottom: -250px;
  }
  .relative-hero-section {
    height: 70vh;
    margin-bottom:300px!important;
  }
}
.custom-hero-title {
font-weight: 700;
font-size: 58px;
line-height: 60px;
}
</style>
