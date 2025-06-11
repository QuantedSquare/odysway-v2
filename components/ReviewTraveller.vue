<template>
  <!-- <v-lazy
    :min-height="200"
    :options="{ threshold: 0.3 }"
    transition="fade-transition"
  > -->
  <v-sheet elevation="0">
    <v-card-item>
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
          >
            {{ review.voyageTitle }}
          </NuxtLink>
        </div>
      </v-card-title>
      <v-card-subtitle class="mt-4 ">
        <div class="d-inline-flex ga-1">
          <v-img
            v-for="i in 5"
            :key="i"
            :src="img('/icons/orange-star.svg', { format: 'webp', quality: 70, width: 640 })"
            alt="Rating stars"
            height="20"
            width="20"
          />
        </div>
      </v-card-subtitle>
    </v-card-item>
    <!-- <v-card-text
        class="text-h5 font-weight-bold text-primary max-lines mb-10 mb-md-0"
        style="max-height: 250px;"
      >
        <MDC
          :value="formatReviewText(review.text)"
          tag="article"
        />
      </v-card-text> -->
    <v-card-text
      class="text-h5 font-weight-bold text-primary max-lines mb-0 mb-md-0 pb-0 line-height text-wrapper"
    >
      <div
        ref="content"
        class="text-content"
        :class="{ truncated: !isExpanded }"
      >
        <!-- :style="contentStyle" -->
        <MDC
          :value="formatReviewText(review.text)"
          tag="article"
        />
      </div>
    </v-card-text>

    <!-- <v-card-actions class="text-decoration-underline">
        <v-btn
          variant="text"
          class="text-h5"
          @click="() => isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Lire moins' : 'Lire plus' }}
          <v-icon
            :icon="mdiArrowRight"
            color="primary"
            :class="isExpanded ? 'rotate-180' : ''"
          />
        </v-btn>
      </v-card-actions> -->
  </v-sheet>
  <!-- </v-lazy> -->
</template>

<script setup>
import { mdiArrowRight } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()
defineProps({
  review: {
    type: Object,
    required: true,
  },
})
const isExpanded = ref(true)
const content = ref(null)
const lineHeight = 30 // px, match your CSS
const clampLines = 3

// const contentStyle = ref({
//   maxHeight: `${lineHeight * clampLines}px`,
//   overflow: 'hidden',
//   transition: 'max-height 0.5s ease',
// })

watch(isExpanded, async (newVal) => {
  await nextTick()
  if (newVal) {
    // Expanding: animate to full height
    contentStyle.value.maxHeight = content.value.scrollHeight + 'px'
  }
  else {
    // Collapsing: animate to 3 lines
    contentStyle.value.maxHeight = `${lineHeight * clampLines}px`
  }
})
function formatReviewText(text) {
  return text.replace(/\\n|\n/g, '<br>')
}
</script>

<style scoped>
/* .max-lines{
 line-clamp: 3!important;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
} */
.line-height{
  line-height: 140% !important;
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
</style>
