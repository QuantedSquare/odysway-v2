<template>
  <v-col class="mr-0 pr-0">
    <NuxtLink
      :to="`/${type}/${slug}`"
      class="image-wrapper default-expanded rounded"
      @click="handleCardClick"
    >

      <v-img
        v-if="srcUrl"
        :src="srcUrl"
        :lazy-src="lazySrc"
        :srcset="srcset"
        sizes="(max-width: 600px) 150px, (max-width: 960px) 300px, 350px"
        loading="lazy"
        width="100%"
        :alt="`Image de la thématique ${title}`"
        cover
      />

      <div class="blur-overlay" />
      <div class="image-overlay" />

      <div
        class="content-wrapper "
      >
        <h3
          key="title"
          class=" font-weight-bold custom-font-size text-center text-shadow text-line-space mx-2 mx-md-3"
        >
          {{ title }}
        </h3>
      </div>
    </NuxtLink>
  </v-col>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: 'Cliquez pour en apprendre plus',
  },
  type: {
    type: String,
    required: true,
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

// Build optimized Sanity URLs with proper sizes for card dimensions
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
  // Default to 300px for mobile-first approach (displayed at ~315px on desktop)
  return buildSanityImageUrl(300, 400, 65)
})

const srcset = computed(() => {
  return [
    `${buildSanityImageUrl(150, 200, 60)} 150w`,
    `${buildSanityImageUrl(300, 400, 65)} 300w`,
    `${buildSanityImageUrl(350, 470, 70)} 350w`,
    `${buildSanityImageUrl(450, 600, 70)} 450w`,
  ].join(', ')
})

const lazySrc = computed(() => {
  return buildSanityImageUrl(150, 200, 10)
})
</script>

<style scoped>
.image-wrapper {
  position: relative;
  display: flex;
  height: 415px;
  width: 100%;
  cursor: pointer;
  overflow: hidden;
  aspect-ratio: 4/5; /* Ensures stable card size regardless of image/content */
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

.content-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem 0;
  height: 100%;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
}

.custom-font-size {
  font-size: 28px!important;
}

@media screen and (max-width: 600px) {
  .image-wrapper {
    min-height: 120px;
    max-height: 120px;
    height: 120px;
    width: 150px;

  }
  .content-wrapper{
    padding: 0;
    justify-content: center;
  }
  .custom-font-size {
    font-size: 0.9rem!important;
    text-shadow: 10px 0 15px rgb(0, 0, 0)!important;
  }
}
</style>
