<template>
  <v-container>
    <v-row
      justify="center"
    >
      <v-col
        cols="12"
        class="d-flex justify-center ga-2"
      >
        <v-chip
          v-for="item of destinationsFiltered"
          :key="item.title"
          variant="outlined"
          :class="item.slug === selectedDestinationSlug ? 'bg-secondary': ''"
          :to="`/destinations/${item.slug}`"
          class="text-decoration-none px-2"
          @click="setSelectedDestinationSlug(item.slug)"
        >
          {{ item.title }}
        </v-chip>
      </v-col>
    </v-row>
    <DestinationsCarousel :destinations="countries" />
      
  </v-container>
</template>

<script setup>
const props = defineProps({
  destinations: {
    type: Array,
    default: () => [],
  },
})

const selectedDestinationSlug = ref(props.destinations[0].slug)

const destinationsFiltered = computed(() => {
  return props.destinations.filter(destination => destination.visible)
})
function setSelectedDestinationSlug(slug) {
  selectedDestinationSlug.value = slug
}

const countries = computed(() => {
  return props.destinations.find(destination => destination.slug === selectedDestinationSlug.value).countries
})
</script>
