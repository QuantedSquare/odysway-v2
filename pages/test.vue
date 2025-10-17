<template>
  <div>
    <img
      :src="voyage.imageUrl"
      alt="Voyage Image"
      width="100%"
      height="100%"
    >
  </div>
</template>

<script setup>
// definePageMeta({
//   layout: 'blank',
// })
const payload = useNuxtApp().payload
console.log(payload)
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
    "imageUrl": image.asset->url,
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

const { data: voyage } = await useAsyncData(
  'test-checkout',
  async () => {
    const { data } = await useSanityQuery(voyageQuery, {})
    return data.value
  },
  {
    server: true,
  },
)
console.log(voyage.value)
</script>
