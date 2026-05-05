<template>
  <!-- <v-lazy
    :min-height="200"
    :options="{ threshold: 0.3 }"
    transition="fade-transition"
  > -->
  <v-sheet elevation="0">
    <v-card-item class="px-2">
      <v-card-title class="d-flex align-center ga-2">
        <AvatarImg
          :avatar-img="review?.photo"
          avatar-size="62"
          :name="review.author"
        />
        <div class="d-flex flex-column text-truncate">
          <span class="text-h5"> {{ review.author }}</span>
          <NuxtLink
            v-if="review.voyageTitle && review.voyageSlug"
            :to="`/voyages/${review.voyageSlug}`"
            class="text-body-2 text-primary text-truncate pb-2"
            :class="{ 'd-none': isTravelPage }"
          >
            {{ review.voyageTitle }}
          </NuxtLink>
        </div>
      </v-card-title>
      <v-card-subtitle class="mt-4 ">
        <div class="d-inline-flex ga-1">
          <v-img
            v-for="i in +review.rating"
            :key="i"
            :src="img('/icons/orange-star.svg', { format: 'webp', quality: 70, width: 640 })"
            alt="Rating stars"
            height="20"
            width="20"
          />
        </div>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text
      class="text-h6 font-weight-regular text-primary  mb-0 mb-md-0 pb-0 line-height  px-2"
    >
      <div
        ref="reviewContent"
        :class="{ 'truncated': shouldTruncate && !isExpanded, 'text-content': shouldTruncate }"
        :style="shouldTruncate ? contentStyle : {}"
      >
        {{ formatReviewText(review.text) }}
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
  isTravelPage: {
    type: Boolean,
    default: false,
  },
})

const { readScrollHeight } = useLayoutRead()
const isExpanded = ref(false)
const reviewContent = ref(null)
const clampHeight = 175 // 5 lignes × 35px

const shouldTruncate = computed(() => (props.review?.text?.length || 0) > 200)

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
.line-height{
  line-height: 140% !important;
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
