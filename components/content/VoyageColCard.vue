<template>
  <v-col
    v-if="status === 'pending'"
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
    v-else-if="status === 'success' && voyage"
  >
    <!-- <v-lazy
      :options="{ threshold: 0.5 }"
      transition="fade-transition"
      class="bg-grey-light-2 rounded-xl custom-height-lazy"
    > -->
    <VoyageCard :voyage="voyage" />
    <!-- </v-lazy> -->
  </v-col>
</template>

<script setup>
const { slug } = defineProps({
  slug: {
    type: String,
    required: true,
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

<style scoped>
.custom-height-lazy{
  min-height: 455px!important;
  min-width: 406px!important;
  max-width: 600px!important;
}
@media screen and (max-width: 1280px) {
  .custom-height-lazy{
    min-height: 438px!important;
    min-width: 406px!important;
  }
}
@media screen and (max-width: 1400px) {
  .custom-height-lazy{
    min-width: 350px!important;
  }
}
@media screen and (max-width: 1240px) {
  .custom-height-lazy{
    min-height: 420px!important;
    min-width: 350px!important;
  }
}
@media screen and (max-width: 960px) {
  .custom-height-lazy{
    min-height: 420px!important;
  }
}
@media screen and (max-width: 750px) {
  .custom-height-lazy{
    min-width: 280px!important;
  }
}
@media screen and (max-width: 600px) {
  .custom-height-lazy{
    min-height: 343px!important;
    min-width: 280px!important;
  }
}
</style>
