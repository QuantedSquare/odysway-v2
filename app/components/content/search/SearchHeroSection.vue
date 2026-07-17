<template>
  <!-- SEO/crawler H1: rendered server-side (unlike the visual hero below, which is
       gated on isHydrated). Visually hidden so the hero design is unchanged. -->
  <h1 class="hero-seo-title">{{ heroTitle }}</h1>
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
        <span
          v-if="destination && !isCategory && !isExperience && !isNextDepartures"
          class="custom-hero-title"
        >
          {{ `${pageContent?.searchHero?.voyagePrefix || 'Nos voyages'} ${destination.interjection || 'en'} ${destination.title || destination.nom}` }}
        </span>
        <span
          v-else-if="destination && isCategory"
          class="custom-hero-title"
        >
          {{ destination.discoveryTitle || destination.title }}
        </span>
        <span
          v-else-if="destination && isExperience"
          class="custom-hero-title"
        >
          {{ destination.discoveryTitle || destination.title }}
        </span>
        <span
          v-else-if="destination && isNextDepartures"
          class="custom-hero-title d-flex flex-column ga-4"
        >
          <span>Prochains départs</span>
          <span class="text-h3">{{ nextDeparturesTitle }}</span>
        </span>
        <span
          v-else
          class="custom-hero-title"
        >
          {{ pageContent?.heroText || pageContent?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage' }}
        </span>
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <v-img
          v-if="displayedImg"
          :src="img(displayedImg, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(displayedImg, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          size="(max-width: 600) 480px, 1500px"
          :srcset="`${img(displayedImg, { format: 'webp', quality: 70, width: 640 })} 480w, ${img(displayedImg, { format: 'webp', quality: 70, width: 1024 })} 1500w`"
          height="302"
          class="rounded-md"
          cover
          :alt="destination?.image?.alt "
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
      :src="img(displayedImg || '/images/homeHero.jpeg', { format: 'webp', quality: 80, height: 900, width: 1536 })"
      :lazy-src="img(displayedImg || '/images/homeHero.jpeg', { format: 'webp', quality: 10, height: 900, width: 1536 })"
      size="(max-width: 600) 480px, 1500px"
      :srcset="`${img(displayedImg || '/images/homeHero.jpeg', { format: 'webp', quality: 80, width: 640 })} 480w, ${img(displayedImg || '/images/homeHero.jpeg', { format: 'webp', quality: 80, width: 1024 })} 1500w`"
      height="50vh"
      :alt="destination?.image?.alt || 'Image principale Hero d\'Odysway'"
      class="rounded-md"
      cover
    >
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
              <span
                v-if="destination && !isCategory && !isExperience && !isNextDepartures"
                class="custom-hero-title"
              >
                {{ `${pageContent?.searchHero?.voyagePrefix || 'Nos voyages'} ${destination.interjection || 'en'} ${destination.title}` }}
              </span>
              <span
                v-else-if="destination && isCategory"
                class="custom-hero-title"
              >
                {{ destination.discoveryTitle || destination.title }}
              </span>
              <span
                v-else-if="destination && isExperience"
                class="custom-hero-title"
              >
                {{ destination.discoveryTitle || destination.title }}
              </span>
              <span
                v-else-if="destination && isNextDepartures"
                class="custom-hero-title"
              >
                {{ nextDeparturesTitle }}
              </span>
              <span
                v-else
                class="custom-hero-title ml-3"
              >
                {{ pageContent?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage' }}
              </span>
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
import { getImageUrl } from '~/utils/getImageUrl'

const img = useImage()
const { width } = useDisplay()
const { destination, isCategory, isExperience, isNextDepartures, noMarginBottom, pageContent } = defineProps({
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
  pageContent: {
    type: Object,
    default: null,
  },
})

const displayedImg = computed(() => {
  if (destination?.image?.src) {
    return destination.image.src
  }
  else {
    if (destination?.image?.asset?._ref) {
      const url = getImageUrl(destination.image.asset._ref)
      return url || '/images/homeHero.jpeg'
    }
    if (pageContent?.image?.asset?._ref) {
      const url = getImageUrl(pageContent.image.asset._ref)
      return url || '/images/homeHero.jpeg'
    }
    else {
      return '/images/homeHero.jpeg'
    }
  }
})
const isHydrated = ref(false)

const nextDeparturesTitle = computed(() => {
  if (!isNextDepartures || !destination) return pageContent?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage'

  const dest = destination.destination || destination
  const period = destination.periodFilter
  const hasPeriod = destination.isDateFilter && period && period !== 'Toutes périodes'

  const destText = dest?.title
    ? `${dest.interjection || 'en'} ${dest.title}`
    : null

  if (destText && hasPeriod) return `${destText} du ${period}`
  if (destText) return destText
  if (hasPeriod) return period

  return pageContent?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage'
})
// Single source of truth for the page H1, rendered server-side (see template).
// It only depends on props/content — never on client-only `width` — so it is
// hydration-safe outside the isHydrated gate.
const heroTitle = computed(() => {
  if (destination && !isCategory && !isExperience && !isNextDepartures) {
    return `${pageContent?.searchHero?.voyagePrefix || 'Nos voyages'} ${destination.interjection || 'en'} ${destination.title || destination.nom}`
  }
  if (destination && (isCategory || isExperience)) {
    return destination.discoveryTitle || destination.title
  }
  if (destination && isNextDepartures) {
    return `Prochains départs ${nextDeparturesTitle.value}`
  }
  return pageContent?.heroText || pageContent?.searchHero?.defaultTitle || 'Trouvez votre prochain voyage'
})

onMounted(() => {
  isHydrated.value = true
})
</script>

<style scoped>
/* Visually-hidden but present for crawlers/screen readers (SSR H1). */
.hero-seo-title {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

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
  z-index: 10;
  pointer-events: auto;
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

/* Ensure v-img content doesn't block pointer events on mobile */
@media (max-width: 960px) {
  .gradient-overlay {
    pointer-events: none;
  }
  .h-100.d-flex.align-center.position-relative {
    pointer-events: none;
  }
  /* Ensure v-img doesn't extend beyond its bounds and block clicks */
  :deep(.v-img) {
    overflow: hidden;
  }
}
</style>
