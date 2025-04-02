<template>
  <v-container fluid>
    <v-chip-group
      v-model="selectedDestination"
      selected-class="bg-secondary"
      :mobile="true"
      mobile-breakpoint="md"
      show-arrows
      class="mb-4 chip-group"
    >
      <v-chip
        v-for="item of destinationsFiltered"
        :key="item.title"
        variant="outlined"
        :value="item.slug"
        class="text-decoration-none"
        @click="(event) => navigateToDestination(item.slug, event)"
      >
        {{ item.title }}
      </v-chip>
    </v-chip-group>
    <CountriesCarousel
      v-model:slug="selectedCountry"
      :countries="countriesFiltered"
    />
  </v-container>
</template>

<script setup>
const props = defineProps({
  destinations: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()

const selectedCountry = ref(null)

const getSlugString = (slug) => {
  if (!slug) return 'top'
  return Array.isArray(slug) ? slug[0] : slug
}

const selectedDestination = ref(getSlugString(route.params.slug))

async function navigateToDestination(slug, event) {
  if (route.path.includes('destinations')) {
    event.preventDefault()
    navigateTo(`/destinations/${slug}`)
  }
  else {
    await navigateTo(`/destinations/${slug}`)
  }
}

const destinationsFiltered = computed(() => {
  return props.destinations.filter(destination => destination.visible)
})

const countriesFiltered = computed(() => {
  console.log('selected country drawer', selectedCountry.value)

  if (selectedCountry.value === null) {
    return props.destinations.find((destination) => {
      return destination.slug === selectedDestination.value
    })?.countries
  }

  return props.destinations.find((destination) => {
    return destination.countries.some(c => c.slug === selectedCountry.value)
  }).countries
})
</script>
