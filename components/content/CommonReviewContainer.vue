<template>
  <v-container
    fluid
  >
    <v-row
      align="center"
      class="position-relative px-0"
    >
      <v-col
        v-if="route.name === 'index'"
        cols="12"
        class="text-h2 my-4"
      >
        <slot name="title" />
      </v-col>
      <v-col
        v-else
        cols="12"
        class="text-h2 my-md-4"
      >
        Ils en parlent mieux que nous
      </v-col>
    </v-row>
    <v-row v-if="reviewsToDisplay">
      <v-col
        v-for="review, index in reviewsToDisplay"
        :key="review.id + index"
        cols="12"
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
          v-if="route.name === 'index'"
          class="text-body-1 font-weight-bold mx-4 text-white"
        >
          <slot
            mdc-unwrap="p"
            name="cta"
          />
        </div>
        <div
          v-else
          class="text-body-1 font-weight-bold mx-4 text-white"
        >
          Afficher plus de témoignages
        </div>
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup>
const route = useRoute()
const { data: reviewsToDisplay } = await useAsyncData(`reviewsToDisplay-${route.name}`, () => {
  return queryCollection('reviews').where('isOnHome', '=', true).limit(3).all()
})
// console.log('reviewsToDisplay', reviewsToDisplay.value)
</script>
