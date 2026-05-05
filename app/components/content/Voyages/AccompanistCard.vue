<template>
  <v-card
    variant="text"
    class="mb-4 py-md-6"
  >
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          sm="auto"
          class="d-flex justify-center justify-sm-start"
        >
          <NuxtImg
            v-if="image?.asset?._ref && accompanistImageSrcUrl"
            :src="accompanistImageSrcUrl"
            :srcset="accompanistImageSrcset"
            :sizes="`${avatarSize}px`"
            :alt="`Photo de ${name}`"
            format="webp"
            loading="lazy"
            :class="`accompanist-avatar accompanist-avatar-${avatarSize}`"
          />
          <div
            v-else
            :class="`accompanist-avatar-fallback accompanist-avatar-${avatarSize}`"
          >
            {{ name ? name[0].toUpperCase() : '' }}
          </div>
        </v-col>
        <v-col class="d-flex flex-column justify-center align-center align-sm-start ga-md-2">
          <v-list-item-title class="text-h5 font-weight-bold text-center text-sm-start no-white-space ">
            {{ name }}
          </v-list-item-title>
          <v-list-item-subtitle class="no-white-space text-h5 pb-1">
            {{ role }}
          </v-list-item-subtitle>
          <div
            v-if="description?.length > 0"
            class="mt-4 my-md-2 text-grey text-subtitle-2 text-md-body-2 font-weight-regular"
          >
            <div
              ref="descContent"
              :class="{ 'truncated': shouldTruncate && !isExpanded, 'text-content': shouldTruncate }"
              :style="shouldTruncate ? contentStyle : {}"
            >
              <EnrichedText :value="description" />
            </div>
            <div v-if="shouldTruncate">
              <v-btn
                variant="text"
                width="fit-content"
                class="text-h5 text-decoration-underline d-flex justify-start align-center pl-0"
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
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'
import { shouldTruncatePortableText } from '~/utils/getPortableTextLength'

const config = useRuntimeConfig()
const props = defineProps({
  image: {
    type: Object,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  description: {
    type: Array,
    default: () => [],
  },
  role: {
    type: String,
    default: '',
  },
  avatarSize: {
    type: String,
    default: '100',
  },
})

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const buildAccompanistImageUrl = (width, height, quality = 75) => {
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

const accompanistImageSrcUrl = computed(() => {
  const size = parseInt(props.avatarSize) || 100
  return buildAccompanistImageUrl(size, size, 70)
})

const accompanistImageSrcset = computed(() => {
  const size = parseInt(props.avatarSize) || 100
  return [
    `${buildAccompanistImageUrl(size, size, 70)} ${size}w`,
    `${buildAccompanistImageUrl(size * 2, size * 2, 75)} ${size * 2}w`,
  ].join(', ')
})

const { readScrollHeight } = useLayoutRead()
const isExpanded = ref(false)
const descContent = ref(null)
const clampHeight = 90 // 3 lignes × 30px

const shouldTruncate = computed(() => shouldTruncatePortableText(props.description, 150))

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
  if (shouldTruncate.value && !isExpanded.value) {
    contentStyle.value.maxHeight = `${clampHeight}px`
  }
})
</script>

<style scoped>
.no-white-space {
  white-space: normal;
}

.accompanist-avatar {
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  flex-shrink: 0;
}

.accompanist-avatar-80 {
  width: 80px;
  height: 80px;
}

.accompanist-avatar-100 {
  width: 100px;
  height: 100px;
}

.accompanist-avatar-fallback {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgb(var(--v-theme-primary));
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.accompanist-avatar-fallback.accompanist-avatar-80 {
  width: 80px;
  height: 80px;
  font-size: 32px;
}

.accompanist-avatar-fallback.accompanist-avatar-100 {
  width: 100px;
  height: 100px;
  font-size: 40px;
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
