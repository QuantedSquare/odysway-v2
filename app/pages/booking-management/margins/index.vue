<template>
  <div>
    <BoPageHeader
      title="Marges"
      subtitle="Marges estimées et réelles des départs, et configuration des tableaux par voyage."
      :crumbs="[{ title: 'Backoffice', to: '/booking-management' }, { title: 'Marges' }]"
    />

    <div class="bo-well">
      <v-tabs
        v-model="tab"
        class="align-self-start"
      >
        <v-tab value="dashboard">
          Tableau de bord
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
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BoPageHeader from '~/components/booking/BoPageHeader.vue'
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
