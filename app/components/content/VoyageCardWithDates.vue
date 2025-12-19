<template>
  <NextDepartureCard
    v-if="shouldShowNextCard"
    :voyage="cardVoyage"
  />
  <VoyageCard
    v-else
    :voyage="cardVoyage"
  />
</template>

<script setup>
import { getDateStatus } from '~/utils/getDateStatus'

const props = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
  datesBySlug: {
    type: Object,
    default: () => ({}),
  },
  preferConfirmedDate: {
    type: Boolean,
    default: false,
  },
})

const slug = computed(() => props.voyage.slug?.current || props.voyage.slug)
const dates = computed(() => (slug.value ? props.datesBySlug[slug.value] || [] : []))

const earliestDeparture = computed(() => {
  if (!dates.value.length) return null
  return dates.value
    .filter(d => d.departure_date)
    .sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date))[0]
})

const confirmedDeparture = computed(() => {
  if (!props.preferConfirmedDate || !dates.value.length) return null
  return dates.value.find((date) => {
    const status = getDateStatus(date)
    return status?.status === 'confirmed'
  }) || null
})

const selectedDeparture = computed(() => confirmedDeparture.value || earliestDeparture.value)

const isGroupTravel = computed(() => props.voyage.availabilityTypes?.includes('groupe'))

const shouldShowNextCard = computed(() => isGroupTravel.value && dates.value.length > 0)

const cardVoyage = computed(() => {
  if (!shouldShowNextCard.value) return props.voyage
  return {
    ...props.voyage,
    dates: dates.value,
    departureDate: selectedDeparture.value?.departure_date,
  }
})
</script>
