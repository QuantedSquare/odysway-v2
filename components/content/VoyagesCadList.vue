<template>
  <v-container fluid>
    <v-row dense>
      <v-col
        v-for="voyage, index in voyages"
        :key="index"
        cols="12"
        sm="6"
        md="4"
      >
        <VoyageCard :voyage="voyage" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  voyagesSlugs: {
    type: Array,
    required: true,
  },
})

const { data: voyages } = await useAsyncData('voyages', () => {
  return queryCollection('voyages').where('slug', 'IN', props.voyagesSlugs)
})
</script>
