<template>
    <div
      v-if="authorNote"
      class="text-primary d-flex flex-column px-2"
    >
      <h4
        v-if="page?.authorNote?.title"
        class="text-h4 font-weight-bold mb-4"
      >
        {{ page.authorNote.title }}
      </h4>

      <!-- Always render the content div, but handle truncation on client -->
      <div
        v-if="authorNote?.text"
        class="text-subtitle-2 text-md-body-2 line-height-2 text-wrapper"
      >
        <div
          ref="content"
          :class="{ 'truncated': shouldTruncate && !isExpanded, 'text-content': shouldTruncate }"
          :style="shouldTruncate ? contentStyle : {}"
        >
          <EnrichedText :value="authorNote.text" />
          <!-- <MDC
            tag="article"
            :value="authorNote.text"
          /> -->
        </div>
      </div>

      <!-- Expand/collapse button - render consistently but handle client-side logic -->
      <div v-if="shouldTruncate">
        <v-btn
          variant="text"
          width="fit-content"
          class="text-body-2 text-md-body-1 d-flex justify-start align-center pl-0"
          @click="toggleExpanded"
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

      <!-- Author section with proper loading states -->
      <div
        v-if="author"
        class="d-flex ga-3 mt-md-4 mt-2"
      >
        <NuxtImg
          v-if="authorImageSrcUrl"
          :src="authorImageSrcUrl"
          :srcset="authorImageSrcset"
          sizes="(max-width: 600px) 80px, 80px"
          :alt="author.description || 'Photo de l\'auteur'"
          format="webp"
          loading="lazy"
          class="author-avatar"
        />
        <div class="text-subtitle-2 d-flex flex-column justify-center">
          <span class="font-weight-bold mb-1">
            {{ author.name }}
          </span>
          <span class="font-weight-regular">
            {{ author.position }} &nbsp;{{ authorNote?.affixeAuthor }}
          </span>
        </div>
      </div>
    </div>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import imageUrlBuilder from '@sanity/image-url'
import { shouldTruncatePortableText } from '~/utils/getPortableTextLength'

const config = useRuntimeConfig()
const props = defineProps({
  authorNote: {
    type: Object,
    default: undefined,
  },
  page: {
    type: Object,
    required: true,
  },
})

const builder = imageUrlBuilder({
  projectId: config.public.sanity.projectId,
  dataset: config.public.sanity.dataset,
})

const author = computed(() => props.authorNote?.author)

// Build optimized Sanity URLs for author avatar (80px x 80px)
const buildAuthorImageUrl = (width, height, quality = 75) => {
  if (!author.value?.image?.asset?._ref) return ''
  return builder
    .image(author.value.image.asset._ref)
    .width(width)
    .height(height)
    .format('webp')
    .quality(quality)
    .fit('crop')
    .url()
}

const authorImageSrcUrl = computed(() => {
  // Default to 80px for avatar
  return buildAuthorImageUrl(80, 80, 70)
})

const authorImageSrcset = computed(() => {
  // Provide multiple sizes for retina displays
  return [
    `${buildAuthorImageUrl(80, 80, 70)} 80w`,
    `${buildAuthorImageUrl(160, 160, 75)} 160w`,
  ].join(', ')
})
// Client-side state for expansion
const isExpanded = ref(false)
const content = ref(null)
const lineHeight = 30 // px, match your CSS
const clampLines = 4

// Computed property to determine if text should be truncated
// Ensure this is consistent between server and client
const shouldTruncate = computed(() => {
  return shouldTruncatePortableText(props.authorNote?.text, 700)
})

// Initial content style - consistent between server and client
const contentStyle = ref({
  maxHeight: `${lineHeight * clampLines}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

const { readScrollHeight } = useLayoutRead()

// Toggle function for expansion
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// Watch for expansion changes and handle animations on client only
watch(isExpanded, async (newVal) => {
  // Only run on client side
  if (import.meta.client && content.value) {
    await nextTick()
    if (newVal) {
      // Expanding: animate to full height using batched layout read
      const scrollHeight = await readScrollHeight(content.value)
      contentStyle.value.maxHeight = scrollHeight + 'px'
    }
    else {
      // Collapsing: animate to clamped height
      contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
    }
  }
})

// Reset content style when component mounts on client
onMounted(() => {
  if (shouldTruncate.value && !isExpanded.value) {
    contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
  }
})
</script>

<style scoped>
.line-height-2 {
  line-height: 30px !important;
}
@media (max-width: 600px) {
  .line-height-2 {
    line-height: 20px !important;
  }
}

.text-wrapper {
  position: relative;
  width: 100%;
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

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  flex-shrink: 0;
}
</style>
