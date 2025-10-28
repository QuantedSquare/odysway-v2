<template>
  <div class="mt-8 mt-md-0">
    <div class="relative-hero-section mb-16 hero-image-wrapper">
      <img
        v-if="srcUrl"
        :src="srcUrl"
        :srcset="srcset"
        sizes="(max-width: 600px) 100vw, (max-width: 960px) 960px, 1536px"
        alt="Image principale Hero d'Odysway"
        class="hero-image"
        loading="eager"
        fetchpriority="high"
      >
      <div class="hero-overlay h-100 d-flex align-center">
        <v-container class="text-white text-h4 text-md-h2 font-weight-bold text-shadow text-center">
          <v-row
            justify="center"
            align="center"
          >
            <v-col
              cols="12"
              md="auto"
            >
              <h1 class="custom-hero-title ">
                <slot name="title" />
              </h1>
              <slot name="subtitle" />
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
    <div class="searchfield-overlap">
      <SearchField />
    </div>
  </div>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'

const { image } = defineProps({
  image: {
    type: Object,
    required: true,
  },
})

const config = useRuntimeConfig()
const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

// Build optimized Sanity URLs with proper sizes for each breakpoint
const buildSanityImageUrl = (width, height, quality = 75) => {
  if (!image?.asset?._ref) return ''
  return builder
    .image(image.asset._ref)
    .width(width)
    .height(height)
    .format('webp')
    .quality(quality)
    .fit('max')
    .url()
}

const srcUrl = computed(() => {
  // Default to 600px for mobile-first approach
  return buildSanityImageUrl(600, 400, 60)
})

const srcset = computed(() => {
  return [
    `${buildSanityImageUrl(400, 300, 55)} 400w`,
    `${buildSanityImageUrl(600, 400, 60)} 600w`,
    `${buildSanityImageUrl(960, 600, 65)} 960w`,
    `${buildSanityImageUrl(1536, 900, 75)} 1536w`,
  ].join(', ')
})

const lazySrc = computed(() => {
  return buildSanityImageUrl(600, 400, 10)
})
</script>

<style scoped>
.img-shadow{
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
.title-container {
  container-type: inline-size;
}
.title-container .responsive-title {
  font-size: 19.2cqw;
  text-align: start;
}
.responsive-subtitle {
  font-size: 10.9cqw;
  text-align: start;
}
.relative-hero-section {
 position:relative;
 height: 600px;
 width: 100%;
}

.hero-image-wrapper {
 position: relative;
 width: 100%;
 height: 100%;
 border-radius: 12px;
 overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  aspect-ratio: 1536 / 900;
  display: block;
  position: relative;
  z-index: 0;
}

.hero-overlay {
  position: absolute !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.custom-hero-title {
font-weight: 700;
font-size: 78px;
line-height: 80px!important;
margin-bottom: 45px;
}

.searchfield-overlap {
  max-width: 1070px;
  margin: -110px auto 0 auto;
}
.hero-height {
  height: 600px;
}
@media (max-width: 960px) {
  .relative-hero-section {
    height: 70vh;
  }

  .custom-hero-title {
    font-size: 60px!important;
    line-height: 55px!important;
    margin-bottom: 85px;
  }
  .searchfield-overlap {
    margin: -150px auto 0 auto;
  }
}
@media (max-width: 600px) {
  .relative-hero-section {
    height: 50vh;
  }
  .hero-height {
    height: 50vh;
  }
  .custom-hero-title:deep(p) {
    font-size: 35px!important;
    line-height: 30px!important;
    margin-bottom: 0;
  }
  .searchfield-overlap {
    margin: -150px auto 0 auto;
  }
}
</style>
