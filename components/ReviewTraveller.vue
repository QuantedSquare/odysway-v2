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
      class="text-h5 font-weight-bold text-primary  mb-0 mb-md-0 pb-0 line-height  px-2"
    >
      <ExpandableText
        :clamp-lines="5"
        :line-height="35"
      >
        <MDC
          :value="formatReviewText(review.text)"
          tag="article"
        />
      </ExpandableText>
    </v-card-text>
  </v-sheet>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
defineProps({
  review: {
    type: Object,
    required: true,
  },
  isTravelPage: {
    type: Boolean,
    default: false,
  },
})

function formatReviewText(text) {
  return text.replace(/\\n|\n/g, '<br>')
}
</script>

<style scoped>
.line-height{
  line-height: 140% !important;
}
</style>
