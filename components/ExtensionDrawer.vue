<template>
  <v-navigation-drawer
    v-model="model"
    location="top"
    temporary
    class="zIndex nav-height"
  >
    <TransitionGroup name="slide-fade">
      <!-- <DestinationsDrawerContent
        v-if="extension === 'destinations'"
        :destinations="destinationsItems"
      />
      <ProposDrawerContent
        v-else-if="extension === 'propos'"
        :propos="proposItems.propos"
      /> -->
      <DefaultDrawerContent />
    </TransitionGroup>
  </v-navigation-drawer>
</template>

<script setup>
defineProps({
  extension: String,
})
const model = defineModel()
// const [
//   { data: destinationsItems },
//   { data: proposItems },
// ] = await Promise.all([
//   useAsyncData('destinations', () => queryCollection('destinations').all()),
//   useAsyncData('propos', () => queryCollection('propos').first()),
// ])
</script>

<style scoped>
.zIndex{
  /* z-index: 1050 !important; */
}
.nav-height{
  height: 100px !important;
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(100px);
  opacity: 0;
}
</style>
