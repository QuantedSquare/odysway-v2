<template>
  <v-container
    fluid
  >
    <v-row
      align="center"
      class="position-relative px-0"
    >
      <v-col
        cols="12"
        class="text-h2 my-4"
      >
        <slot name="title" />
      </v-col>
    </v-row>
    <v-row v-if="reviewsToDisplay">
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
    </v-row>
    <v-row
      v-if="reviewsToDisplay"
      justify="center"
      class="mt-12"
    >
      <v-btn
        to="/avis-voyageurs"
        color="primary"
        height="62"
        size="large"
        class="text-decoration-none"
      >
        <div
          class="text-body-1 font-weight-bold mx-4"
          :class="`text-white`"
        >
          <slot
            mdc-unwrap="p"
            name="cta"
          />
        </div>
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup>
const { data: reviewsToDisplay } = await useAsyncData(() => {
  return queryCollection('reviews').where('isOnHome', '=', true).limit(3).all()
})
</script>
