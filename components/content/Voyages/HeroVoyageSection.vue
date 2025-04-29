<template>
  <v-container
    fluid
  >
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <h1 class="text-h2 font-weight-bold">
          <slot name="title" />
        </h1>
      </v-col>
      <v-col class="d-flex align-start justify-md-end ga-4">
        <RatingBadge
          :rating="deal.rating"
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
          <div class="text-primary text-body-2 text-lg-body-1 font-weight-medium d-flex align-center ga-2">
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
          v-if="status === 'success'"
          :src="img(imageSrc1, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(imageSrc1, { format: 'webp', quality: 10, height: 900, width: 1536 })"
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
          v-if="status === 'success'"
          :src="img(imageSrc2, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(imageSrc2, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          cover
          height="214"
          rounded="lg"
        />
        <v-img
          v-if="status === 'success'"
          :src="img(imageSrc2, { format: 'webp', quality: 70, height: 900, width: 1536 })"
          :lazy-src="img(imageSrc1, { format: 'webp', quality: 10, height: 900, width: 1536 })"
          cover
          height="214"
          rounded="lg"
        />
      </v-col>
    </v-row>
    <v-row class="media-btns-position">
      <v-col cols="auto">
        <slot name="component-slot-1" />
      </v-col>
      <v-col
        v-if="isVideoAdded"
        cols="auto"
      >
        <slot name="component-slot-2" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiExportVariant } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

defineProps({
  imageSrc1: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
  imageSrc2: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
  imageSrc3: {
    type: String,
    default: '/images/Laponie-(1).webp',
  },
})

const { mdAndUp } = useDisplay()
const img = useImage()
const route = useRoute()
const deal = inject('deal')
const snackbar = ref(false)

const { data: page, status } = useAsyncData(route.path, () => {
  return queryCollection('voyages').path(route.path).first()
})
const isVideoAdded = computed(() => {
  return page.value.body.value[0].length > 4
})

function copyUrl() {
  const copiedUrl = `https://localhost:3000/${route.fullPath}`
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
