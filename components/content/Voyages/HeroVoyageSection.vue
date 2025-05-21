<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        md="8"
        class="mb-md-5"
      >
        <h1 class="text-primary text-h2 font-weight-bold">
          {{ voyage.title }}
        </h1>
      </v-col>
      <v-col class="d-flex align-start justify-md-end ga-4">
        <RatingBadge
          :rating="voyage.rating"
          :comments="voyage.comments"
          elevation="2"
        />
        <v-btn
          ref="shareBtn"
          color="white"
          rounded="pill"
          class="btn-shadow"
          :height="mdAndUp ? 46 : 36"
          @click="copyUrl"
        >
          <div class="text-primary text-body-2 font-weight-medium d-flex align-center ga-2">
            <v-icon
              :icon="mdiExportVariant"
              :size="mdAndUp ? 20 : 16"
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
    height="455"
    class="d-flex align-center position-relative"
  >
    <v-row>
      <v-col
        cols="12"
        sm="9"
      >
        <v-img
          :src="img(voyage.image.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(voyage.image.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          cover
          height="455"
          rounded="lg"
        />
      </v-col>
      <v-col
        cols="3"
        class="d-none d-sm-flex flex-column ga-7"
      >
        <v-img
          v-if="voyage.imageSecondary"
          :src="img(voyage.imageSecondary.src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(voyage.imageSecondary.src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          cover
          height="214"
          rounded="lg"
        />
        <v-img
          v-if="voyage.photosList.length > 0"
          :src="img(voyage.photosList[0].src, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(voyage.photosList[0].src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          cover
          height="214"
          rounded="lg"
        />
      </v-col>
    </v-row>
    <v-row class="media-btns-position">
      <v-col cols="auto">
        <PhotoGalleryDialog
          v-if="voyage.photosList.length > 0"
          :photos-list="voyage.photosList"
        />
      </v-col>
      <v-col
        v-if="voyage.videoLinks.length > 0"
        cols="auto"
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
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const config = useRuntimeConfig()
defineProps({
  voyage: {
    type: Object,
    required: true,
  },
})

const { mdAndUp } = useDisplay()
const img = useImage()
const route = useRoute()
const snackbar = ref(false)

function copyUrl() {
  // TODO: change to the dynamic url
  //  use runtime config
  console.log('config', config)
  const copiedUrl = `${config.public.appUrl}/${route.fullPath}`
  navigator.clipboard.writeText(copiedUrl)
  snackbar.value = true
}
</script>

<style scoped>
.media-btns-position{
  position: absolute;
  bottom: 9%;
  left: 4%;
}

@media screen and (max-width: 1280px) {
  .media-btns-position{
  position: absolute;
  bottom: 21px;
  left: 42px;
}
}
</style>
