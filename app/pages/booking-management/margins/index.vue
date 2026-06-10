<template>
  <v-container
    fluid
    class="py-6"
  >
    <v-row class="align-center mb-2">
      <v-col cols="12">
        <h1 class="text-h5 font-weight-bold mb-1">
          Marges
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Suivez les marges estimées et réelles des départs, et configurez les tableaux de marge par voyage.
        </p>
      </v-col>
    </v-row>

    <v-tabs
      v-model="tab"
      color="primary"
      class="mb-4"
    >
      <v-tab value="dashboard">
        Dashboard
      </v-tab>
      <v-tab value="config">
        Configuration
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="dashboard">
        <MarginsDashboard :voyages-list="voyagesList || []" />
      </v-window-item>
      <v-window-item value="config">
        <MarginsConfiguration :voyages-list="voyagesList || []" />
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import MarginsDashboard from '~/components/booking/MarginsDashboard.vue'
import MarginsConfiguration from '~/components/booking/MarginsConfiguration.vue'

definePageMeta({
  layout: 'booking',
  middleware: 'booking-management',
})

const tab = ref('dashboard')

const sanity = useSanity()
const voyagesQuery = groq`*[_type == "voyage" && ('groupe' in availabilityTypes)]{
  "slug": slug.current,
  title,
  image {
    asset -> { url }
  }
}`
const { data: voyagesList } = await useAsyncData('marginsVoyagesList', () =>
  sanity.fetch(voyagesQuery),
)
</script>
