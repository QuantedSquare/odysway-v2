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
      <ExpandableText
        :clamp-lines="3"
        :line-height="20"
        collapsed-text="Voir plus"
        expanded-text="Voir moins"
        button-class="text-subtitle-2"
      >
        <div class="text-caption font-weight-regular pa-0">
          « {{ formatReviewText(review.text) }} »
        </div>
      </ExpandableText>
    </div>
    <v-spacer class="py-0 my-0" />
    <div class="text-caption font-weight-bold text-truncate">
      {{ review.author }}<span v-if="review.authorAge"> · {{ review.authorAge }} ans</span><span v-if="voyageTitle"> · Voyage {{ voyageTitle }}</span>
    </div>
  </v-sheet>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()

const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})

const voyageTitle = computed(() => props.review.voyage?.title || props.review.voyageTitle || null)

function formatReviewText(text) {
  return text.replace(/\\n|\n/g, ' ')
}
</script>
