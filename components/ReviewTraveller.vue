<template>
  <v-lazy
    :min-height="200"
    :options="{ threshold: 0.3 }"
    transition="fade-transition"
  >
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
      <v-card-text
        class="text-h5 font-weight-bold text-primary max-lines overflow-y-auto mb-10 mb-md-0"
        style="max-height: 250px;"
      >
        <MDC
          :value="formatReviewText(review.text)"
          tag="article"
        />
      </v-card-text>
    </v-sheet>
  </v-lazy>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
defineProps({
  review: {
    type: Object,
    required: true,
  },
})

function formatReviewText(text) {
  return text.replace(/\\n|\n/g, '<br>')
}
</script>

<style scoped>
.max-lines{
 line-clamp: 3!important;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
