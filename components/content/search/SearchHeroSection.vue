<template>
  <v-container
    fluid
    class="relative-hero-section mb-16 rounded-md bg-primary d-flex align-center"
  >
    <v-row>
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center justify-center"
      >
        <h1
          v-if="isHydrated && destination && !isCategory"
          class="custom-hero-title"
        >
          {{ `Nos voyages ${destination.interjection} ${destination.titre}` }}
        </h1>
        <h1
          v-else-if="isHydrated && destination && isCategory"
          class="custom-hero-title"
        >
          {{ destination.discoveryTitle }}
        </h1>
        <h1
          v-else
          class="custom-hero-title"
        >
          Trouvez votre prochain voyage
        </h1>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <v-img
          v-if="isHydrated && destination"
          :src="img(destination.image.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(destination.image.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          size="(max-width: 600) 480px, 1500px"
          :srcset="`${img(destination.image.src, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(destination.image.src, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
          height="302"
          class="rounded-md"
          cover
          :alt="destination.image.alt"
        />
        <v-img
          v-else
          :src="img('/images/homeHero.jpeg', { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img('/images/homeHero.jpeg', { format: 'webp', quality: 10, height: 900, width: 1536 })"
          size="(max-width: 600) 480px, 1500px"
          :srcset="`${img('/images/homeHero.jpeg', { format: 'webp', quality: 70, width: 640 })} 480w, ${img('/images/homeHero.jpeg', { format: 'webp', quality: 70, width: 1024 })} 1500w`"
          height="302"
          class="rounded-md"
          cover
          alt="Trouvez votre prochain voyage, image hero section"
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
const { destination, isCategory } = defineProps({
  destination: {
    type: Object,
    default: null,
  },
  isCategory: {
    type: Boolean,
    default: false,
  },
})
const isHydrated = ref(false)
onMounted(() => {
  isHydrated.value = true
})
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
  .custom-hero-title {
    font-size: 42px!important;
    line-height: 42px!important;
  }
}
.custom-hero-title {
font-weight: 700;
font-size: 50px;
line-height: 50px;
}
</style>
