<template>
  <v-navigation-drawer
    expand-on-hover
    location="top"
    class="zIndex"
  >
    <component
      :is="drawerConent"
      :items="extensionItems"
    />
  </v-navigation-drawer>
</template>

<script setup>
import ProposDrawerContent from './ProposDrawerContent.vue'
import DestinationsDrawerContent from './DestinationsDrawerContent.vue'

const props = defineProps({
  extension: String,
})

const { data: destinationsItems } = await useAsyncData(() => {
  return queryCollection('destinations').all()
})

const { data: proposItems } = await useAsyncData(() => {
  return queryCollection('propos').all()
})

const drawerConent = computed(() => {
  return props.extension === 'destinations' ? DestinationsDrawerContent : ProposDrawerContent
})

const extensionItems = computed(() => {
  switch (props.extension) {
    case 'destinations': return destinationsItems.value
    case 'propos': return proposItems.value[0].propos
    default: return null
  }
})
</script>

<style scoped>
.zIndex{
  z-index: 1050 !important;
}
</style>
