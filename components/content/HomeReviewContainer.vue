<template v-if="reviewsToDisplay">
  <v-col
    v-for="review, index in reviewsToDisplay"
    :key="review.id + index"
    cols="11"
    sm="6"
    md="4"
    class="px-0 px-md-3"
  >
    <ReviewTraveller :review="review" />
  </v-col>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const { data: reviews } = await useAsyncData(() => {
  return queryCollection('reviews').where('isOnHome', '=', true).limit(10).all()
})

const reviewsToDisplay = computed(() => {
  if (smAndDown.value) {
    return reviews.value.slice(0, 3)
  }
  return reviews.value
})
</script>
