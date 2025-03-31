<template>
  <v-navigation-drawer
    expand-on-hover
    location="top"
    class="zIndex nav-height"
  >
    <DestinationsDrawerContent
      v-if="extension === 'destinations'"
      :destinations="destinationsItems"
    />
    <ProposDrawerContent
      v-else-if="extension === 'propos'"
      :propos="proposItems.propos"
    />
  </v-navigation-drawer>
</template>

<script setup>
import ProposDrawerContent from './ProposDrawerContent.vue'
import DestinationsDrawerContent from './DestinationsDrawerContent.vue'

defineProps({
  extension: String,
})

const [
  { data: destinationsItems },
  { data: proposItems },
] = await Promise.all([
  useAsyncData('destinations', () => queryCollection('destinations').all()),
  useAsyncData('propos', () => queryCollection('propos').first()),
])
</script>

<style scoped>
.zIndex{
  z-index: 1050 !important;
}
.nav-height{
  height: 233px !important;
}
</style>
