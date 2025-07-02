<template>
  <v-col
    v-if="status === 'pending' && !voyage"
    cols="10"
    sm="6"
    md="4"
    class="pr-1 pr-md-3"
  >
    <v-skeleton-loader
      class="mx-auto"
      type="card"
      height="250"
    />
  </v-col>
  <v-col
    v-else-if="voyage"
  >
    <!-- <v-lazy
      :min-height="228"
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
    > -->
    <VoyageCard :voyage="voyage" />
    <!-- </v-lazy> -->
  </v-col>
</template>

<script setup>
const { slug } = defineProps({
  slug: {
    type: String,
    // required: true,
  },
})

const { data: voyage, status } = await useAsyncData(`voyage-${slug}`, async () => {
  const travel = await queryCollection('voyages')
    .select('slug', 'image', 'rating', 'comments', 'title', 'groupeAvailable', 'duration', 'pricing')
    .where('slug', '=', slug)
    .first()
  return travel
})
</script>
