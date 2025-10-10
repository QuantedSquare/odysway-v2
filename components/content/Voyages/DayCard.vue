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
            <span v-if="description">{{ description }}</span>
            <div class="d-flex flex-column px-8 mt-4">
              <div v-if="denivellation">
                <span class="font-weight-bold">Dénivelé:&nbsp;</span>
                <span>{{ denivellation }}</span>
              </div>
              <div v-if="road">
                <span class="font-weight-bold">Temps de trajet:&nbsp;</span>
                <span>{{ road }}</span>
              </div>
              <div v-if="night">
                <span class="font-weight-bold">Nuit:&nbsp;</span>
                <span>{{ night }}</span>
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

defineProps({
  photo: {
    type: Object,
    required: true,
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
    type: String,
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
  // Wait for next tick to ensure the element is rendered
  nextTick(() => {
    // Force a resize observation if needed
    if (colContainer.value) {
      // Trigger a resize event to update the size
      window.dispatchEvent(new Event('resize'))
    }
  })
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
