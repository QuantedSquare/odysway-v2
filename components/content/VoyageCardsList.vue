<template>
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
      <NextVoyageCard
        :deal="deal"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col
      ref="scroll-target"
      cols="12"
    >
      <h2 class="text-primary text-h4 text-md-h3 font-weight-black mt-10">
        {{ selectedFilter }}
      </h2>
    </v-col>
    <v-col
      v-for="deal in paginatedDeals"
      :key="`${deal.slug}-${deal.departureDate}`"
      cols="12"
      sm="6"
      md="4"
      lg="3"
      class="py-md-6"
    >
      <NextVoyageCard
        :deal="deal"
      />
    </v-col>
    <v-col cols="12">
      <v-pagination
        v-model="pagination.currentPage"
        :length="nbPages"
        :total-visible="5"
        variant="flat"
        density="comfortable"
        rounded="circle"
        active-color="primary"
        elevation="3"
        class="my-4"
        @click="goTo(scrollTarget, { offset: -50 })"
        @next="pagination.currentPage = pagination.currentPage++"
        @prev="pagination.currentPage = pagination.currentPage-- "
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { useGoTo } from 'vuetify'

const props = defineProps({
  filteredDeals: {
    type: Object,
    default: () => {},
  },
  dealsLastminute: {
    type: Array,
    default: () => [],
  },
  selectedFilter: {
    type: String,
  },
  toggledBtn: {
    type: String,
  },
})

const goTo = useGoTo()
const scrollTarget = useTemplateRef('scroll-target')

const pagination = ref({
  currentPage: 1,
  itemsPerPage: 8,
})

const paginatedDeals = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = pagination.value.currentPage * pagination.value.itemsPerPage
  return props.filteredDeals.slice(start, end)
})

const nbPages = computed(() => {
  return Math.ceil(props.filteredDeals.length / pagination.value.itemsPerPage)
})

watch(() => props.selectedFilter, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})

watch(() => props.toggledBtn, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    pagination.value.currentPage = 1
  }
})
</script>
