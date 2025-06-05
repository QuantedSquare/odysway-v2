<template>
  <v-col
    v-if="loading && !voyage"
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
const loading = ref(false)
const voyage = ref(null)
const props = defineProps({
  voyageSlug: {
    type: String,
    required: true,
  },
})

const loadVoyage = async () => {
  loading.value = true
  voyage.value = await queryCollection('voyages').where('slug', '=', props.voyageSlug).first()
  loading.value = false
}

await loadVoyage()
</script>
