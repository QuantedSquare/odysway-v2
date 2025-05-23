<template v-if="reviews">
  <v-col
    v-for="review, index in reviews"
    :key="review.id + index"
    cols="12"
    sm="6"
    md="4"
  >
    <ReviewTraveller :review="review" />
  </v-col>
</template>

<script setup>
const { data: reviews } = await useAsyncData(() => {
  return queryCollection('reviews').where('isOnHome', '=', true).limit(10).all()
})
</script>
