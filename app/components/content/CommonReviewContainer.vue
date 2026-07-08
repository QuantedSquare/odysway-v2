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
        class="my-4"
      >
        <p
          v-if="eyebrow"
          class="review-eyebrow"
        >
          {{ eyebrow }}
        </p>
        <div class="text-h2">
          <slot name="title" />
        </div>
      </v-col>
      <v-col
        v-else
        cols="12"
        class="text-h2 my-md-4 text-primary"
      >
        Ils en parlent mieux que nous
      </v-col>
    </v-row>
    <ClientOnly>
      <v-row v-if="reviewsToDisplay && reviewsToDisplay.length > 0">
        <v-col
          v-for="review, index in reviewsToDisplay"
          :key="review._id + index"
          cols="12"
          sm="6"
          md="4"
          class="px-0 px-md-3"
        >
          <ReviewTraveller :review="review" />
        </v-col>
      </v-row>

      <v-row
        v-if="reviewsToDisplay && reviewsToDisplay.length > 0"
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
    </ClientOnly>
  </v-container>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
})

const route = useRoute()

const reviewsToDisplayQuery = `
  *[_type == "homePage"][0]{
    reviews{
      reviews[]->{
        _id,
        author,
        authorAge,
        date,
        photo,
        rating,
        text,
        voyage->{
          slug,
          title,
        }
      }
    },
  }
`

const { data: reviewsToDisplaySanity } = await useSanityQuery(reviewsToDisplayQuery)

const reviewsToDisplay = computed(() => {
  return reviewsToDisplaySanity.value?.reviews?.reviews?.map(review => ({
    ...review,
    voyageSlug: review.voyage?.slug?.current,
    voyageTitle: review.voyage?.title,
  })).slice(0, 3)
})
</script>

<style scoped>
.review-eyebrow {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-secondary));
}
</style>
