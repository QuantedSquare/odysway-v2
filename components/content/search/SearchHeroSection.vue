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
          v-if="isHydrated && destination"
          class="custom-hero-title"
        >
          {{ `Nos voyages ${destination.interjection} ${destination.titre}` }}
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
defineProps({
  destination: {
    type: Object,
    default: null,
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
font-size: 58px;
line-height: 60px;
}
</style>
