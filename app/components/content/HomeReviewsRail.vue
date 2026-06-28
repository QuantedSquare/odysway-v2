<template>
  <div>
    <HorizontalCarousel
      v-if="reviews.length"
      text-color="primary"
      slider-name="home-reviews"
      :eyebrow="eyebrow"
    >
      <template #title>
        <span style="color: rgba(43, 76, 82, 1)">{{ title }}</span>
      </template>
      <template #carousel-item>
        <v-col
          v-for="review in reviews"
          :key="review._id"
          cols="auto"
          class="pa-2"
        >
          <ReviewPhotoCard :review="review" />
        </v-col>
      </template>
    </HorizontalCarousel>

    <div class="d-flex justify-center mt-8">
      <v-btn
        to="/avis-voyageurs"
        color="primary"
        height="60"
        size="large"
        class="text-body-1 font-weight-bold px-8"
      >
        {{ ctaText || 'Voir tous les avis' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  eyebrow: {
    type: String,
    default: '',
  },
  ctaText: {
    type: String,
    default: '',
  },
})

const reviewsQuery = groq`*[_type == "homePage"][0]{
  reviews{
    reviews[]->{
      _id,
      author,
      photo,
      rating,
      text,
      voyage->{ slug, title }
    }
  }
}`

const { data } = await useSanityQuery(reviewsQuery, undefined, { dedupe: 'defer' })

const reviews = computed(() =>
  (data.value?.reviews?.reviews || [])
    .filter(Boolean)
    .map(r => ({
      ...r,
      voyageSlug: r.voyage?.slug?.current,
      voyageTitle: r.voyage?.title,
    }))
    .slice(0, 9),
)
</script>
