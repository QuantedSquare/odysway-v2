<template>
  <v-container fluid>
    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <h1 class="text-h2 font-weight-bold">
          <slot name="title" />
        </h1>
      </v-col>
      <v-col class="text-body-2 text-lg-body-1 d-flex align-start justify-md-end ga-4">
        <RatingBadge
          :rating="deal.rating"
          elevation="2"
        />
        <v-btn
          color="white"
          rounded="pill"
          height="46"
          class="btn-shadow"
          @click="copyUrl"
        >
          <div class="d-flex align-center ga-2">
            <v-icon
              :icon="mdiExportVariant"
              size="20"
              color="primary"
            />
            <span class="text-primary text-body-2 font-weight-medium mt-1">
              Partager
            </span>
          </div>
        </v-btn>
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
    <v-row class="media-btns-position w-100">
      <v-col
        cols="12"
        sm="auto"
        class="text-center"
      >
        <slot name="component-slot-1" />
      </v-col>
      <v-col
        v-if="isVideoAdded"
        cols="12"
        sm="auto"
        class="text-center"
      >
        <slot name="component-slot-2" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { mdiExportVariant } from '@mdi/js'
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

const img = useImage()
const route = useRoute()
const deal = inject('deal')

const { data: page, status } = useAsyncData(route.path, () => {
  return queryCollection('voyages').path(route.path).first()
})
const isVideoAdded = computed(() => {
  return page.value.body.value[0].length > 4
})

function copyUrl() {
  const copiedUrl = `https://localhost:3000/${route.fullPath}`
  navigator.clipboard.writeText(copiedUrl)
  alert('copied url : ', copiedUrl)
}
</script>

<style scoped>
.media-btns-position{
  position: absolute;
  bottom: 10%;
  left: 4%;
}
</style>
