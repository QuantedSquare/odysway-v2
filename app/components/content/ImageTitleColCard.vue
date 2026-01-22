<template>
  <v-col
    cols="6"
    sm="4"
    md="3"
  >
    <v-lazy
      :min-height="228"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    >
      <NuxtLink
        :to="link"
        class="image-wrapper default-expanded"
        @click="handleCardClick"
      >
        <v-img
          v-if="srcUrl"
          :src="srcUrl"
          :lazy-src="lazySrc"
          :srcset="srcset"
          :alt="`Image représentant ${title}`"
          sizes="(max-width: 600px) 200px, (max-width: 960px) 280px, 320px"
          cover
          height="228"
          loading="lazy"
        />

        <div class="blur-overlay" />
        <div class="image-overlay" />
        <div class="content-overlay">
          <div class="w-100 d-flex flex-column align-center justify-center">
            <h3 class="category-title font-weight-bold  text-h3 d-flex align-center text-center text-shadow ">{{ title }}</h3>
          </div>
        </div>
      </NuxtLink>
    </v-lazy>
  </v-col>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'

const props = defineProps({
  image: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '/',
  },
  subtitle: {
    type: String,
    default: '',
  },
  promotionName: {
    type: String,
    default: null,
  },
})

const { trackSelectPromotion } = useGtmTracking()

const config = useRuntimeConfig()
const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

// Build optimized Sanity URLs for grid card dimensions
const buildSanityImageUrl = (width, height, quality = 70) => {
  if (!props.image?.asset?._ref) return ''
  return builder
    .image(props.image.asset._ref)
    .width(width)
    .height(height)
    .format('webp')
    .quality(quality)
    .fit('crop')
    .url()
}

const handleCardClick = () => {
  // Track promotion selection if promotionName is provided
  if (props.promotionName) {
    trackSelectPromotion(props.title, props.promotionName)
  }
}

const srcUrl = computed(() => {
  // Default to 280px for mobile-first approach (grid displays at ~200-320px)
  return buildSanityImageUrl(280, 280, 65)
})

const srcset = computed(() => {
  return [
    `${buildSanityImageUrl(200, 200, 60)} 200w`,
    `${buildSanityImageUrl(280, 280, 65)} 280w`,
    `${buildSanityImageUrl(320, 320, 70)} 320w`,
    `${buildSanityImageUrl(400, 400, 70)} 400w`,
  ].join(', ')
})

const lazySrc = computed(() => {
  return buildSanityImageUrl(200, 200, 10)
})
</script>

<style scoped>
.image-wrapper {
  position: relative;
  display: flex;
  height: 228px;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  border-radius: 1rem;
  transition: all 0.5s ease-in-out;
}
@media (max-width: 500px) {
  .image-wrapper {
    max-height: 200px;
  }
}

.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  mask: linear-gradient(transparent, rgb(0, 0, 0), black);
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper:hover .blur-overlay,
.image-wrapper.default-expanded .blur-overlay {
  opacity: 1;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.752));
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.image-wrapper:hover .image-overlay,
.image-wrapper.default-expanded .image-overlay {
  opacity: 1;
}

.content-overlay {
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 1rem;
  color: white;
  transform: translateY(calc(100% - 5rem));
  transition: transform 0.5s ease-in-out;
  z-index: 1;
}

.category-title {
  margin: -1.5em 0 0 0;
  font-size: 32px!important;
}

.category-description {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
}

@media screen and (max-width: 1280px) {
  .text-to-wrap {
    padding-bottom: 10px;
  }
  .category-title {
    margin: -60px 0 0 0 !important;
    font-size: 28px!important;
  }
}

@media screen and (max-width: 600px) {
  .category-title {
    margin: -2rem 0 0 0 !important;

    font-size: 1.2rem !important;
  }
  .image-wrapper {
    height: 16rem;
  }
}
@media screen and (max-width: 400px) {
  .category-title {
    font-size: 1rem !important;
    line-height: 1.4rem !important;
  }
}
</style>
