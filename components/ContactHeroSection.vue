<template>
  <v-container
    fluid
    class="rounded-md bg-primary"
  >
    <v-row>
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center justify-center"
      >
        <h1 class="custom-hero-title text-center text-md-left">
          Contactez nous
        </h1>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <v-img
          :src="img('/images/team/team-photo.webp', { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img('/images/homeHero.jpeg', { format: 'webp', quality: 10, height: 900, width: 1536 })"
          size="(max-width: 600) 480px, 1500px"
          :srcset="`${img('/images/team/team-photo.webp', { format: 'webp', quality: 70, width: 640 })} 480w, ${img('/images/team/team-photo.webp', { format: 'webp', quality: 70, width: 1024 })} 1500w`"
          height="302"
          class="rounded-md"
          cover
          alt="Équipe Odysway"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
</script>

<style scoped>
  .custom-hero-title {
  font-weight: 700;
  font-size: 68px;
  line-height: 80px;
  }
@media (max-width: 960px) {
  .custom-hero-title {
    font-size: 60px!important;
    line-height: 42px!important;
  }
}
</style>
