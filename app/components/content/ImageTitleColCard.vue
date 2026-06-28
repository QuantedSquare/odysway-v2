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
          class="card-img"
          cover
          height="228"
          loading="lazy"
        />

        <div class="blur-overlay" />
        <div class="image-overlay" />
        <div class="content-overlay">
          <div class="category-head">
            <span
              v-if="iconPath"
              class="category-icon"
            >
              <v-icon
                :icon="iconPath"
                size="20"
              />
            </span>
            <h3 class="category-title font-weight-bold text-shadow">{{ title }}</h3>
          </div>
        </div>
      </NuxtLink>
    </v-lazy>
  </v-col>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'
import { categoryIcon } from '~/utils/categoryIcons'

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
  icon: {
    type: String,
    default: null,
  },
})

// Only show an icon when the category explicitly defines one (no generic
// fallback — the client preferred no picto over a default one).
const iconPath = computed(() => (props.icon ? categoryIcon(props.icon) : null))

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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.25rem 1rem;
  color: #fff;
  z-index: 1;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.category-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  transition:
    background 0.4s ease,
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.category-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
}

/* Image zoom layer */
.card-img {
  transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

/* Hover choreography: lift + image zoom + icon fills with brand colour */
@media (hover: hover) {
  .image-wrapper:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 38px rgba(12, 22, 20, 0.3);
  }

  .image-wrapper:hover .card-img {
    transform: scale(1.08);
  }

  .image-wrapper:hover .category-icon {
    background: rgb(var(--v-theme-secondary));
    border-color: transparent;
    transform: scale(1.08);
  }

  .image-wrapper:hover .content-overlay {
    transform: translateY(-4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .image-wrapper,
  .card-img,
  .category-icon,
  .content-overlay {
    transition: none;
  }
}

@media screen and (max-width: 1280px) {
  .category-title {
    font-size: 20px;
  }
}

@media screen and (max-width: 600px) {
  .image-wrapper {
    height: 16rem;
  }
  .category-icon {
    width: 32px;
    height: 32px;
  }
  .category-title {
    font-size: 1.1rem;
  }
}

@media screen and (max-width: 400px) {
  .category-title {
    font-size: 1rem;
    line-height: 1.3rem;
  }
}
</style>
