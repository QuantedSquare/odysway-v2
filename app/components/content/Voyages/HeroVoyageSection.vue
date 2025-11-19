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
    class="d-flex align-start align-md-center position-relative px-0 custom-height mb-2 mb-md-0 pt-0 pt-md-4"
  >
    <v-row class="align-start ">
      <v-col
        cols="12"
        :sm="voyage.imageSecondary?.asset?._ref ? 9 : 12"
      >
        <NuxtImg
          v-if="mainImageSrcUrl"
          :src="mainImageSrcUrl"
          :srcset="mainImageSrcset"
          sizes="(max-width: 600px) 100vw, (max-width: 960px) 66vw, 75vw"
          :alt="voyage.image?.alt || `Image principale du voyage ${voyage.title}`"
          format="webp"
          preload
          loading="eager"
          fetchpriority="high"
          class="custom-height voyage-main-image rounded-lg"
        />
      </v-col>
      <v-col
        cols="3"
        class="d-none d-sm-flex flex-column ga-7"
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
      <v-col
        cols="auto"
      >
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
        <VideoDialog
          :videos-link="voyage.videoLinks"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiExportVariant } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'
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

// Build optimized Sanity URLs for main image (455px desktop, 270px mobile)
const buildMainImageUrl = (width, height, quality = 75) => {
  if (!props.voyage?.image?.asset?._ref) return ''
  return builder
    .image(props.voyage.image.asset._ref)
    .width(width)
    .height(height)
    .format('webp')
    .quality(quality)
    .fit('max')
    .url()
}

// Main image: 455px height desktop, 270px mobile
// Assuming 16:9 aspect ratio, but using fit='max' to maintain aspect
const mainImageSrcUrl = computed(() => {
  // Default to mobile size (270px height) for mobile-first
  return buildMainImageUrl(480, 270, 70)
})

const mainImageSrcset = computed(() => {
  // Mobile: 270px height, Desktop: 455px height
  // Widths calculated to maintain reasonable aspect ratios
  return [
    `${buildMainImageUrl(480, 270, 65)} 480w`,
    `${buildMainImageUrl(600, 338, 70)} 600w`,
    `${buildMainImageUrl(800, 450, 75)} 800w`,
    `${buildMainImageUrl(1000, 563, 75)} 1000w`,
  ].join(', ')
})



const photoCarousel = computed(() => {
  if (!props.voyage) return []
  const photos = []
  if (props.voyage.image) photos.push(props.voyage.image)
  if (props.voyage.imageSecondary) photos.push(props.voyage.imageSecondary)
  if (props.voyage.photosList?.length) photos.push(...props.voyage.photosList)
  return photos
})

function copyUrl() {
  const copiedUrl = `${config.public.appUrl}/${route.fullPath}`
  navigator.clipboard.writeText(copiedUrl)
  snackbar.value = true
}
</script>

<style scoped>
.media-btns-position{
  position: absolute;
  bottom: 38px;
  left: 42px;
}
.custom-height{
  height: 455px;
}
.voyage-main-image {
  width: 100%;
  height: 455px;
  max-height: 455px;
  object-fit: cover;
  object-position: center;
}
.voyage-secondary-image {
  width: 100%;
  height: 214px;
  object-fit:cover;
  object-position: center;
}
@media screen and (max-width: 1280px) {
  .media-btns-position{
  position: absolute;
  bottom: 46px;
  left: 42px;
}
}
@media screen and (max-width: 600px) {
  .media-btns-position{
  position: absolute;
  bottom: 15px;
  left: 15px;
}
  .custom-height{
  height: 270px;
  }
}
.custom-btn:deep(button){
  background-color: transparent!important;
  color: rgb(var(--v-theme-primary-light-1))!important;
}
.custom-btn:deep(svg){
border-radius: 100%;
background-color: rgba(255, 255, 255, 0.3);
}
.custom-btn:deep(.v-responsive__content){
display: flex;
align-items: center;
}

.custom-copy-btn-height{
  height: 46px;
}
.custom-copy-btn-height-2{
  height: 46px;
}
.custom-copy-btn-icon-height{
  height: 18px;
  width: 18px;
}
.custom-copy-btn-icon-height-2{
  height: 20px;
  width: 20px;
}
@media screen and (max-width: 600px) {
  .custom-copy-btn-height{
    height: 30px;
  }
  .custom-copy-btn-height-2{
    height: 36px;
  }
  .custom-copy-btn-icon-height{
    height: 14px;
    width: 14px;
  }
  .custom-copy-btn-icon-height-2{
    height: 16px;
    width: 16px;
  }
}
</style>
