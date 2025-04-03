<template>
  <v-container>
    <v-row>
      <v-col
        cols="8"
        sm="10"
        class="text-dark font-weight-black text-h5 text-md-h4 my-4"
      >
        test
      </v-col>
    </v-row>
    <v-row
      v-for="month in sortedMonths"
      :key="month"
    >
      <v-col cols="12">
        <h2>{{ month }}</h2>
      </v-col>
      <v-col
        v-for="voyage in filteredDeals[month]"
        :key="`${voyage.slug}-${voyage.departureDate}`"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <DestinationsColCard
          :month="month"
          :voyage="voyage"
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
})

console.log(props.filteredDeals)
const sortedMonths = computed(() => {
  return Object.keys(props.filteredDeals)
})
</script>
