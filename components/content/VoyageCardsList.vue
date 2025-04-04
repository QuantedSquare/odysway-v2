<template>
  <v-container>
    <v-row v-if="dealsLastminute.length > 0">
      <v-col
        cols="8"
        sm="10"
        class="text-dark font-weight-black my-4"
      >
        <p>Profitez d'une réduction sur nos voyages de <span class="text-secondary">dernière minute</span></p>
      </v-col>
      <v-col
        v-for="deal in dealsLastminute"
        :key="`${deal.slug}-${deal.departureDate}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <DestinationsColCard
          :deal="deal"
        />
      </v-col>
    </v-row>
    <v-row
      v-for="month in sortedMonths"
      :key="month"
    >
      <v-col cols="12">
        <h2 class="text-primary">
          {{ month }}
        </h2>
      </v-col>
      <v-col
        v-for="deal in filteredDeals[month]"
        :key="`${deal.slug}-${deal.departureDate}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <DestinationsColCard
          :deal="deal"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps({
  filteredDeals: {
    type: Object,
    default: () => {},
  },
  dealsLastminute: {
    type: Array,
    default: () => [],
  },
})

const sortedMonths = computed(() => {
  return Object.keys(props.filteredDeals)
})
</script>
