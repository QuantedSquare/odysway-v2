<template>
  <v-sheet
    rounded="lg"
    border
    min-height="210"
    class="pa-4 d-flex flex-column ga-3 min-height-1"
  >
    <v-card-subtitle class="px-0">
      <div class="d-inline-flex ga-1">
        <v-img
          v-for="i in +review.rating"
          :key="i"
          :src="img('/icons/orange-star.svg', { format: 'webp', quality: 70, width: 640 })"
          alt="Rating stars"
          height="15"
          width="15"
        />
      </div>
    </v-card-subtitle>

    <div class="text-body-1 text-primary font-italic">
      <div
        ref="reviewContent"
        :class="{ 'truncated': shouldTruncate && !isExpanded, 'text-content': shouldTruncate }"
        :style="shouldTruncate ? contentStyle : {}"
      >
        <div class="text-subtitle-2 font-weight-regular pa-0">
          « {{ formatReviewText(review.text) }} »
        </div>
      </div>
      <div v-if="shouldTruncate">
        <v-btn
          variant="text"
          width="fit-content"
          class="text-subtitle-2 d-flex justify-start align-center pl-0"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Voir moins' : 'Voir plus' }}
          <v-icon
            :icon="mdiArrowRight"
            color="primary"
            class="mt-1"
            :class="isExpanded ? 'rotate-180' : ''"
          />
        </v-btn>
      </div>
    </div>
    <v-spacer class="py-0 my-0" />
    <div class="text-caption font-weight-bold text-truncate">
      {{ review.author }}<span v-if="review.authorAge"> · {{ review.authorAge }} ans</span><span v-if="voyageTitle"> · Voyage {{ voyageTitle }}</span>
    </div>
  </v-sheet>
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()

const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})

const voyageTitle = computed(() => props.review.voyage?.title || props.review.voyageTitle || null)

const { readScrollHeight } = useLayoutRead()
const isExpanded = ref(false)
const reviewContent = ref(null)
const clampHeight = 60 // 3 lignes × 20px

const shouldTruncate = computed(() => (props.review?.text?.length || 0) > 130)

const contentStyle = ref({
  maxHeight: `${clampHeight}px`,
  overflow: 'hidden',
  transition: 'max-height 0.5s ease',
})

watch(isExpanded, async (newVal) => {
  if (import.meta.client && reviewContent.value) {
    await nextTick()
    if (newVal) {
      const scrollHeight = await readScrollHeight(reviewContent.value)
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

function formatReviewText(text) {
  return text.replace(/\\n|\n/g, ' ')
}
</script>

<style scoped>
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
