<template>
  <v-col
    v-if="loading"
    cols="12"
    sm="6"
    md="4"
  >
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      height="250"
    />
  </v-col>

  <v-col
    v-for="review, index in reviews"
    v-else-if="reviews"
    :key="review.id + index"
    cols="12"
    sm="6"
    md="4"
  >
    <v-lazy
      :min-height="200"
      :options="{ threshold: 0.3 }"
      transition="fade-transition"
    >
      <v-sheet elevation="0">
        <v-card-item>
          <v-card-title class="d-flex align-center ga-2">
            <AvatarImg
              :avatar-img="review.photo"
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
            <v-icon
              v-for="i in 5"
              :key="i"
              :icon="mdiStar"
              :color="i <= review.rating ? 'secondary' : 'grey'"
              size="20"
            />
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
  </v-col>
</template>

<script setup>
import { mdiStar } from '@mdi/js'

const loading = ref(false)
// const { data: reviews, status } = useAsyncData('reviews-home', () => {
//   return queryCollection('reviews').where('isOnHome', '=', true).limit(10).all()
// })
const loadReviews = async () => {
  loading.value = true
  const reviews = await queryCollection('reviews').where('isOnHome', '=', true).limit(10).all()
  console.log('reviews', reviews)
  loading.value = false
  return reviews
}
const reviews = await loadReviews()

function formatReviewText(text) {
  return text.replace(/\\n|\n/g, '<br>')
}
</script>

<style scoped>
.green-border{
  border: 4px solid rgb(var(--v-theme-primary)) !important;
}
.no-white-space {
  white-space: normal;
}
.border-card{
  border-radius: 2% 2% 0 0 !important;
}
.sub-headline{
  font-size: 0.6rem !important;
}
.max-lines{
 line-clamp: 3!important;
  display: -webkit-box;
  -webkit-line-clamp: 7;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
