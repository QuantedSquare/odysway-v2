<template>
  <v-container
    v-if="isHydrated"
    fluid
    class="relative-hero-section mt-8 rounded-md bg-primary d-flex align-center"
    :class="{ 'no-margin-bottom': noMarginBottom }"
  >
    <v-row
      v-if="width > 960"
    >
      <v-col
        cols="12"
        md="4"
        class="d-flex align-center"
      >
        <h1
          v-if="destination && !isCategory && !isExperience && !isNextDepartures"
          class="custom-hero-title"
        >
          {{ `${contentText?.searchHero?.voyagePrefix || 'Nos voyages'} ${destination.interjection} ${destination.titre}` }}
        </h1>
        <h1
          v-else-if="destination && isCategory"
          class="custom-hero-title"
        >
          {{ destination.discoveryTitle || destination.titre }}
        </h1>
        <h1
          v-else-if="destination && isExperience"
          class="custom-hero-title"
        >
          {{ destination.discoveryTitle || destination.titre }}
        </h1>
        <h1
          v-else-if="destination && isNextDepartures"
          class="custom-hero-title"
        >
          {{ destination.periodFilter === null || destination.periodFilter === 'Toutes périodes' ? 'Découvrez nos voyages de groupe' : `Partez avec un groupe de 8 voyageurs maximum en ${destination.periodFilter.toLowerCase()}` }}
        </h1>
        <h1
          v-else
          class="custom-hero-title"
        >
          {{ contentText?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage' }}
        </h1>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <v-img
          v-if="destination?.image?.src"
          :src="img(destination?.image?.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(destination?.image?.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          size="(max-width: 600) 480px, 1500px"
          :srcset="`${img(destination?.image?.src, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(destination?.image?.src, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
          height="302"
          class="rounded-md"
          cover
          :alt="destination?.image?.alt"
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
    <v-img
      v-else
      :src="img(destination ? destination.image?.src : '/images/homeHero.jpeg', { format: 'webp', quality: 80, height: 900, width: 1536 })"
      :lazy-src="img(destination ? destination.image?.src : '/images/homeHero.jpeg', { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(destination ? destination.image?.src : '/images/homeHero.jpeg', { format: 'webp', quality: 80, width: 640 })} 480w, ${img(destination ? destination.image?.src : '/images/homeHero.jpeg', { format: 'webp', quality: 80, width: 1024 })} 1500w`"
      height="50vh"
      :alt="destination ? destination.image?.alt : 'Image principale Hero d\'Odysway'"
      class="rounded-md"
      cover
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular
            indeterminate
            color="primary"
          />
        </div>
      </template>

      <!-- Gradient overlay -->
      <div class="gradient-overlay" />

      <div class="h-100 d-flex align-center position-relative">
        <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
          <v-row
            justify="center"
            align="center"
            no-gutters
          >
            <v-col
              cols="12"
              md="auto"
            >
              <h1
                v-if="destination && !isCategory && !isExperience && !isNextDepartures"
                class="custom-hero-title"
              >
                {{ `${contentText?.searchHero?.voyagePrefix || 'Nos voyages'} ${destination.interjection} ${destination.titre}` }}
              </h1>
              <h1
                v-else-if="destination && isCategory"
                class="custom-hero-title"
              >
                {{ destination.discoveryTitle || destination.titre }}
              </h1>
              <h1
                v-else-if="destination && isExperience"
                class="custom-hero-title"
              >
                {{ destination.discoveryTitle || destination.titre }}
              </h1>
              <h1
                v-else-if="destination && isNextDepartures"
                class="custom-hero-title"
              >
                {{ destination.periodFilter === null || destination.periodFilter === 'Toutes périodes' ? 'Découvrez nos voyages de groupe' : `Partez avec un groupe de 8 voyageurs maximum en ${destination.periodFilter.toLowerCase()}` }}
              </h1>
              <h1
                v-else
                class="custom-hero-title ml-3"
              >
                {{ contentText?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage' }}
              </h1>
              <slot name="subtitle" />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-img>

    <div class="absolute">
      <slot />
    </div>
  </v-container>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const { data: contentText } = await useAsyncData('page-search-search-hero', () =>
  queryCollection('page_search').first(),
)

const img = useImage()
const { width } = useDisplay()
const { destination, isCategory, isExperience, isNextDepartures, noMarginBottom } = defineProps({
  destination: {
    type: Object,
    default: null,
  },
  isCategory: {
    type: Boolean,
    default: false,
  },
  isExperience: {
    type: Boolean,
    default: false,
  },
  isDestination: {
    type: Boolean,
    default: false,
  },
  isNextDepartures: {
    type: Boolean,
    default: false,
  },
  noMarginBottom: {
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

.no-margin-bottom {
  margin-bottom: 0 !important;
}

.absolute {
  position: absolute;
  left:0;
  right: 0;
  bottom: -32px;
}
.custom-hero-title {
font-weight: 700;
font-size: 50px;
line-height: 50px;
}

@media (min-width: 960px) {
  .absolute {
    bottom: -32px;
  }
  .custom-hero-title {
    font-size: 42px!important;
    line-height: 42px!important;
    margin-left: 30.58px;
    margin-bottom: 50px;
  }
}

@media (max-width: 960px) {
  .absolute {
    bottom: -200px;
  }
  .relative-hero-section {
    height: 50vh;
    margin-bottom:250px!important;
  }
  .relative-hero-section.no-margin-bottom {
    margin-bottom: 0 !important;
  }
  .custom-hero-title {
    font-size: 42px!important;
    line-height: 42px!important;
    margin-bottom: 82px;
  }
}

@media (max-width: 400px) {
  .absolute {
    bottom: -200px;
  }
  .relative-hero-section {
    height: 50vh;
  }
  .relative-hero-section.no-margin-bottom {
    margin-bottom: 0 !important;
  }
  .custom-hero-title {
    margin-bottom: 85px !important;
    font-size: 35px!important;
    line-height: 30px!important;
  }
}
</style>
