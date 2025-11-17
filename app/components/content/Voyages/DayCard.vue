<template>
  <v-card
    variant="text"
    class="shadow-none rounded-t-xl rounded-b-sm"
  >
    <v-row v-if="isHydrated">
      <v-col
        ref="colContainer"
        cols="12"
        sm="5"
        lg="auto"
        class="pb-0 pb-sm-3"
      >
        <SanityImage
          v-if="photo?.asset?._ref"
          :asset-id="photo.asset._ref"
          auto="format"
        >
          <template #default="{ src }">
            <v-img
              rounded="lg"
              :src="img(src, { format: 'webp', quality: 70, width: 640 })"
              :alt="`Photo du jour: ${title}`"
              cover
              :width="imageWidth"
              height="214"
            />
          </template>
        </SanityImage>
      </v-col>
      <v-col
        cols="12"
        sm="7"
      >
        <v-card-title class="no-white-space px-2 px-md-0 pb-1">
          <div class="d-flex align-center ga-3">
            <span class="d-flex align-center bg-secondary rounded-lg text-caption text-sm-subtitle-2 font-weight-bold text-white px-2 py-1 text-no-wrap">
              {{ badgeText }}
            </span>

            <span class="text-primary text-h6 font-weight-bold ">{{ title }}</span>
          </div>
        </v-card-title>

        <v-card-text class="text-primary text-subtitle-2 text-md-body-2 font-weight-regular pt-2 line-height px-2 px-md-0 pb-0">
          <ExpandableText
            :clamp-lines="4"
            :line-height="30"
          >
            <span v-if="description"><EnrichedText :value="description" /></span>
            <div
              v-if="denivellation || road || night"
              class="d-flex flex-column  mt-4"
            >
              <div
                v-if="denivellation && stegaClean(denivellation).length > 0"
                class="d-flex align-start ga-2"
              >
                <img
                  src="/icons/denivele.svg"
                  alt="Dénivelé"
                  width="20"
                  height="20"
                >
                <div>
                  <span class="font-weight-bold">Dénivelé:&nbsp;</span>
                  <span>{{ denivellation }}</span>
                </div>
              </div>
              <div
                v-if="road && stegaClean(road).length > 0"
                class="d-flex align-start ga-2"
              >
                <img
                  src="/icons/temps.svg"
                  alt="Temps de trajet"
                  width="20"
                  height="20"
                >
                <div>
                  <span class="font-weight-bold">Temps de trajet:&nbsp;</span>
                  <span>{{ road }}</span>
                </div>
              </div>
              <div
                v-if="night && stegaClean(night).length > 0"
                class="d-flex align-start ga-2"
              >
                <img
                  src="/icons/lune.svg"
                  alt="Nuit"
                  width="20"
                  height="20"
                >
                <div>
                  <span class="font-weight-bold">Nuit:&nbsp;</span>
                  <span>{{ night }}</span>
                </div>
              </div>
            </div>
          </ExpandableText>
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useElementSize } from '@vueuse/core'
import { stegaClean } from '@sanity/client/stega'

defineProps({
  day: {
    type: Object,
    required: true,
  },
  photo: {
    type: Object,
    default: undefined,
  },
  badgeText: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: Array,
    required: true,
  },
  denivellation: {
    type: String,
    default: '',
  },
  road: {
    type: String,
    default: '',
  },
  night: {
    type: String,
    default: '',
  },
})
const img = useImage()
const { xs, width } = useDisplay()
const isHydrated = ref(false)
const colContainer = ref(null)

// Use element size only after hydration
const { width: colContainerWidth } = useElementSize(colContainer, {
  initialSize: { width: 0, height: 0 },
})

// Computed width for the image
const imageWidth = computed(() => {
  if (xs.value) {
    return width.value
  }
  // Use conso if available, otherwise fallback to a reasonable default
  return colContainerWidth.value > 0 ? colContainerWidth.value : 300
})

onMounted(() => {
  isHydrated.value = true
  // useElementSize handles resize observation automatically
})
</script>

<style scoped>
.shadow-none{
  box-shadow: none !important;
}
.line-height{
  line-height: 30px !important;
}
@media (max-width: 600px) {
  .line-height{
    line-height: 23px !important;
  }
}
@media (max-width: 400px) {
  .line-height{
    line-height: 20px !important;
  }
}
</style>
