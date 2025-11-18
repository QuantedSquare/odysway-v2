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
          <ExpandableText
            v-if="description"
            :clamp-lines="3"
            :line-height="30"
            wrapper-class="mt-4 my-md-2 text-grey text-subtitle-2 text-md-body-2 font-weight-regular"
            button-class="text-h5 text-decoration-underline"
          >
            <EnrichedText :value="description" />
          </ExpandableText>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import imageUrlBuilder from '@sanity/image-url'

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

// Build optimized Sanity URLs for accompanist avatar
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
  // Provide multiple sizes for retina displays
  return [
    `${buildAccompanistImageUrl(size, size, 70)} ${size}w`,
    `${buildAccompanistImageUrl(size * 2, size * 2, 75)} ${size * 2}w`,
  ].join(', ')
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
</style>
