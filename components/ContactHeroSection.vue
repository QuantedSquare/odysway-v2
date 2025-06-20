<template>
  <v-container
    fluid
    class="mb-016 mt-8 mt-md-0 rounded-md bg-primary d-flex align-center"
  >
    <v-row>
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center justify-center"
      >
        <h1 class="custom-hero-title text-center text-md-left">
          {{ contactContent?.heroSection?.title || 'Contactez nous' }}
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
          :alt="contactContent?.heroSection?.teamImageAlt || 'Équipe Odysway'"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useImage } from '#imports'

const { contactContent } = defineProps({
  contactContent: {
    type: Object,
    default: () => ({}),
  },
})

const img = useImage()
</script>

<style scoped>
  .custom-hero-title {
  font-weight: 700;
  font-size: 50px;
  line-height: 50px;
  }
@media (max-width: 960px) {
  .custom-hero-title {
    font-size: 42px!important;
    line-height: 42px!important;
  }
}
@media (max-width: 400px) {
  .custom-hero-title {
    font-size: 35px!important;
    line-height: 30px!important;
  }
}
</style>
