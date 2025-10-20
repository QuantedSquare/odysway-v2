<template>
  <div>
    <v-img
      :src="getImageUrl(voyage.imageUrl.asset._ref)"
      :lazy-src="getImageUrl(voyage.imageUrl.asset._ref)"
      alt="Voyage Image"
      width="100%"
      height="100%"
      cover
    >
      <div class="d-flex align-center justify-center">
        <h1>{{ voyage.title }}</h1>
      </div>
    </v-img>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
})
const voyageQuery = /* groq */`
  *[_type == "voyage" && published == true] | order(title asc)[0] {
    _id,
    title,
    duration,
    rating,
    description,
    destinations[]->{_id, title},
    categories[]->{_id, title},
    pricing,
    "imageUrl": image,
    ...,
    programmeBlock[]{
      title,
      badgeText,
      description,
      denivellation,
      road,
      night
    }
  }
`

const { data: voyage } = await useSanityQuery(voyageQuery, {})
</script>
