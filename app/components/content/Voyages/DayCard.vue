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
          <div
            ref="descContent"
            :class="{ 'truncated': shouldTruncate && !isExpanded, 'text-content': shouldTruncate }"
            :style="shouldTruncate ? contentStyle : {}"
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
          </div>
          <div v-if="shouldTruncate">
            <v-btn
              variant="text"
              width="fit-content"
              class="text-body-2 text-md-body-1 d-flex justify-start align-center pl-0"
              @click="isExpanded = !isExpanded"
            >
              {{ isExpanded ? 'Lire moins' : 'Lire plus' }}
              <v-icon
                :icon="mdiArrowRight"
                color="primary"
                class="mt-1"
                :class="isExpanded ? 'rotate-180' : ''"
              />
            </v-btn>
          </div>
        </v-card-text>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { useElementSize } from '@vueuse/core'
import { stegaClean } from '@sanity/client/stega'
import { shouldTruncatePortableText } from '~/utils/getPortableTextLength'

const props = defineProps({
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

const { width: colContainerWidth } = useElementSize(colContainer, {
  initialSize: { width: 0, height: 0 },
})

const imageWidth = computed(() => {
  if (xs.value) {
    return width.value
  }
  return colContainerWidth.value > 0 ? colContainerWidth.value : 300
})

const { readScrollHeight } = useLayoutRead()
const isExpanded = ref(false)
const descContent = ref(null)
const clampHeight = 90 // 3 lignes × 30px

const shouldTruncate = computed(() =>
  shouldTruncatePortableText(props.description, 150)
  || !!(props.denivellation || props.road || props.night),
)

const contentStyle = ref({
  maxHeight: `${clampHeight}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

watch(isExpanded, async (newVal) => {
  if (import.meta.client && descContent.value) {
    await nextTick()
    if (newVal) {
      const scrollHeight = await readScrollHeight(descContent.value)
      contentStyle.value.maxHeight = scrollHeight + 'px'
    }
    else {
      contentStyle.value.maxHeight = `${clampHeight}px`
    }
  }
})

onMounted(() => {
  isHydrated.value = true
  if (shouldTruncate.value && !isExpanded.value) {
    contentStyle.value.maxHeight = `${clampHeight}px`
  }
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
.text-content {
  overflow: hidden;
  transition: max-height 0.5s ease;
  position: relative;
}
.text-content.truncated::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2em;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
}
.rotate-180 {
  transform: rotate(180deg);
}
</style>
