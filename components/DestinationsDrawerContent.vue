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
          v-for="item of destinations"
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
    <DestinationsCarousel>
      <template #carousel-item>
        <v-col
          v-for="country of countries"
          :key="country.country"
          cols="auto"
        >
          <v-card
            :image="country.image"
            :href="`/destinations/${country.slug}`"
            height="120"
            width="120"
          >
            <v-card-title class="position-absolute bottom-0 text-subtitle-1 font-weight-bold text-white no-white-space text-shadow">
              {{ country.country }}
            </v-card-title>
          </v-card>
        </v-col>
      </template>
    </DestinationsCarousel>
  </v-container>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const selectedDestinationSlug = ref(props.items[0].slug)

const destinations = computed(() => {
  return props.items.filter(item => item.isOnPage)
})

function setSelectedDestinationSlug(slug) {
  selectedDestinationSlug.value = slug
}

const countries = computed(() => {
  return props.items.find(item => item.slug === selectedDestinationSlug.value).countries
})
</script>
