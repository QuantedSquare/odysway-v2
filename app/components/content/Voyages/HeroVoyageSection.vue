<template>
  <v-container
    fluid
    class="px-0 mt-4"
  >
    <v-row no-gutters>
      <v-col
        cols="12"
        md="8"
      >
        <h1 class="d-flex flex-column text-primary text-h3 text-md-h2  font-weight-bold px-2 px-md-0   mb-md-0">
          {{ voyage.title }}
          <div class="d-flex align-center mt-2">
            <RatingBadge
              :rating="voyage.rating"
              :comments="voyage.comments"
              elevation="2"
              class="mr-3 d-md-none"
            />
            <v-btn
              ref="shareBtn"
              color="white"
              rounded="pill"
              class="btn-shadow d-md-none custom-copy-btn-height"
              @click="copyUrl"
            >
              <div class="text-primary text-body-2 font-weight-medium d-flex align-center ga-2">
                <v-icon
                  :icon="mdiExportVariant"
                  class="custom-copy-btn-icon-height"
                  color="primary"
                />
                <span class="mt-md-1">Partager</span>
              </div>
            </v-btn>
          </div>
        </h1>
      </v-col>
      <v-col class="d-none d-md-flex align-start justify-end ga-4 mb-3 mb-md-0 ">
        <RatingBadge
          :rating="voyage.rating"
          :comments="voyage.comments"
          elevation="2"
        />
        <v-btn
          ref="shareBtn"
          color="white"
          rounded="pill"
          class="btn-shadow custom-copy-btn-height-2"
          @click="copyUrl"
        >
          <div class="text-primary text-body-2 font-weight-medium d-flex align-center ga-md-2 ga-1">
            <v-icon
              :icon="mdiExportVariant"
              class="custom-copy-btn-icon-height-2"
              color="primary"
            />
            <span class="mt-1">Partager</span>
          </div>
        </v-btn>
        <v-snackbar
          v-model="snackbar"
          location="top"
          timeout="2000"
          color="primary"
        >
          Le lien de ce voyage a été copié avec succès !
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
  <v-container
    fluid
    class="d-flex align-start align-md-center position-relative px-0 custom-height-container mb-md-0 pt-0 pt-md-4 pb-0 pb-md-4"
  >
    <v-row class="align-start ">
      <v-col
        cols="12"
        :md="voyage.imageSecondary?.asset?._ref ? 9 : 12"
      >
        <NuxtImg
          v-if="voyage.image?.asset"
          :src="mainImageSrcUrl"
          sizes="(max-width: 600px) 100vw, (max-width: 960px) 66vw, 75vw"
          :srcset="mainImageSrcset"
          :alt="stegaClean(voyage.image?.alt) || `Image principale du voyage ${voyage.title}`"
          format="webp"
          :preload="{
            fetchpriority: 'high',
          }"
          loading="eager"
          fetchpriority="high"
          width="1000"
          height="100%"
          class="custom-height voyage-main-image rounded-lg"
        />
      </v-col>
      <v-col
        cols="3"
        class="d-none d-md-flex flex-column ga-7"
      >
        <div v-if="voyage.imageSecondary?.asset?._ref">
          <SanityImage
            :asset-id="voyage.imageSecondary.asset._ref"
            auto="format"
          >
            <template #default="{ src }">
              <v-img
                v-if="src"
                :src="src"
                :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
                :alt="voyage.imageSecondary.alt || `Image secondaire du voyage ${voyage.title}`"
                cover
                height="214"
                rounded="lg"
              />
            </template>
          </SanityImage>
        </div>
        <div v-if="voyage.photosList?.length > 0 && voyage.photosList[0].asset?._ref">
          <SanityImage
            :asset-id="voyage.photosList[0].asset._ref"
            auto="format"
          >
            <template #default="{ src }">
              <v-img
                v-if="src"
                :src="src"
                :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
                :alt="voyage.photosList[0].alt || `Photo du voyage ${voyage.title}`"
                cover
                height="214"
                rounded="lg"
              />
            </template>
          </SanityImage>
        </div>
      </v-col>
    </v-row>
    <v-row class="media-btns-position">
      <v-col cols="auto">
        <PhotoGalleryDialog
          v-if="voyage.photosList?.length > 0"
          :photos-list="photoCarousel"
        />
      </v-col>
      <v-col
        v-if="voyage.videoLinks?.length > 0"
        cols="auto"
        class="pl-1"
      >
        <VideoDialog :videos-link="voyage.videoLinks" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiExportVariant } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'
import { stegaClean } from '@sanity/client/stega'
import { useImage } from '#imports'

const config = useRuntimeConfig()
const props = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
})

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})
const img = useImage()
const route = useRoute()
const snackbar = ref(false)
// Build optimized Sanity URLs for main image with hotspot support
// The hotspot is automatically applied when passing the full image object to .image()
// and using .fit('crop') - Sanity will use the hotspot to determine the crop area
const buildMainImageUrl = (width, height, quality = 90) => {
  if (!props.voyage?.image) return ''
  return builder
    .image(props.voyage.image) // Pass full image object (includes hotspot & crop data)
    .width(width)
    .height(height)
    .auto('format')
    .quality(quality)
    .fit('crop') // This will respect the hotspot automatically
    .url()
}
// Use consistent 16:9 aspect ratio across all breakpoints for hotspot to work correctly
// This ensures the same focal region stays meaningful at all screen sizes
// 16:9 ratio: height = width * 9 / 16
const mainImageSrcUrl = computed(() => {
  // Use a good quality base image for the src (fallback for older browsers)
  // 1000px width = 563px height at 16:9 - maintains hotspot consistency
  return buildMainImageUrl(1000, 563, 100)
})

const mainImageSrcset = computed(() => {
  // All sizes use 16:9 aspect ratio - only width varies
  // This allows hotspot to work consistently across all breakpoints
  // IMPORTANT: The width descriptor (e.g., 400w) MUST match the actual image width
  // Format: buildMainImageUrl(actualWidth, calculatedHeight, quality) actualWidthw
  return [
    `${buildMainImageUrl(400, 225, 100)} 400w`, // 400px image = 225px height (16:9)
    `${buildMainImageUrl(600, 338, 100)} 600w`, // 600px image = 338px height (16:9)
    `${buildMainImageUrl(800, 450, 100)} 800w`, // 800px image = 450px height (16:9)
    `${buildMainImageUrl(1000, 563, 100)} 1000w`, // 1000px image = 563px height (16:9)
    `${buildMainImageUrl(1400, 788, 100)} 1400w`, // 1400px image = 788px height (16:9)
  ].join(', ')
})

const photoCarousel = computed(() => {
  if (!props.voyage) return []
  const photos = []
  if (props.voyage.image) photos.push(props.voyage.image)
  if (props.voyage.imageSecondary) photos.push(props.voyage.imageSecondary)
  if (props.voyage.photosList?.length) photos.push(...props.voyage.photosList)
  return photos.filter(photo => photo.asset?._ref || photo.asset?._id).map(photo => ({
    ...photo,
    asset: {
      _ref: photo.asset._ref || photo.asset._id,
      _type: 'sanity.imageAsset',
    },
  }))
})

function copyUrl() {
  const copiedUrl = `${config.public.siteURL}${route.fullPath}`
  navigator.clipboard.writeText(copiedUrl)
  snackbar.value = true
}
</script>

<style scoped>
.media-btns-position {
  position: absolute;
  bottom: 38px;
  left: 42px;
}

.custom-height-container {
  max-height: 460px;
}

/* Container - keep flexible, let image control aspect ratio */
.custom-height {
  /* Remove fixed height to allow aspect-ratio on image to control sizing */
  max-height: 460px;
  min-height: 0;
}

.voyage-main-image {
  width: 100%;
  /* Use aspect-ratio to match the 16:9 images from Sanity */
  /* This ensures the rendered box matches the crop ratio, preventing extra cropping */
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
  min-height: 460px;
  /* The image maintains 16:9, matching the Sanity crop with hotspot */
  /* No additional cropping happens because container and image ratios match */
}

.voyage-secondary-image {
  width: 100%;
  height: 214px;
  object-fit: cover;
  object-position: center;
}

@media screen and (max-width: 1280px) {
  .media-btns-position {
    position: absolute;
    bottom: 46px;
    left: 42px;
  }
}

@media screen and (max-width: 1024px) {}

@media screen and (max-width: 600px) {
  .media-btns-position {
    position: absolute;
    bottom: 40px;
    left: 15px;
  }

  /* Keep 16:9 aspect ratio on mobile too - no height override needed */
  /* The aspect-ratio CSS property handles this automatically */
  .voyage-main-image {
    /* max-height: 280px; */
    min-height: 100%;
  }
}

.custom-btn:deep(button) {
  background-color: transparent !important;
  color: rgb(var(--v-theme-primary-light-1)) !important;
}

.custom-btn:deep(svg) {
  border-radius: 100%;
  background-color: rgba(255, 255, 255, 0.3);
}

.custom-btn:deep(.v-responsive__content) {
  display: flex;
  align-items: center;
}

.custom-copy-btn-height {
  height: 46px;
}

.custom-copy-btn-height-2 {
  height: 46px;
}

.custom-copy-btn-icon-height {
  height: 18px;
  width: 18px;
}

.custom-copy-btn-icon-height-2 {
  height: 20px;
  width: 20px;
}

@media screen and (max-width: 600px) {
  .custom-copy-btn-height {
    height: 30px;
  }

  .custom-copy-btn-height-2 {
    height: 36px;
  }

  .custom-copy-btn-icon-height {
    height: 14px;
    width: 14px;
  }

  .custom-copy-btn-icon-height-2 {
    height: 16px;
    width: 16px;
  }
}
</style>
