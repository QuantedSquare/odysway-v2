<template>
  <v-row
    no-gutters
    class="align-center ga-3 font-weight-bold"
  >
    <div>
      <CustomBadge :color="status.color" />
      {{ status.text }}
    </div>

    <div
      v-if="status.status !== 'pending'"
      class="d-flex align-center ga-2"
    >
      <v-icon
        size="20"
        color="primary"
        class="bg-grey-light rounded-circle"
      >
        {{ mdiAccountOutline }}
      </v-icon>
      {{ bookedPlaces }} inscrit{{ bookedPlaces > 1 ? 's' : '' }}
      <span
        v-if="status.status === 'confirmed'"
        class="font-weight-regular text-body-2"
      >
        - Reste {{ maxTravellers - bookedPlaces > 0 ? maxTravellers - bookedPlaces : 0 }} places
      </span>
    </div>
    <div
      v-else
      class="font-weight-regular"
    >
      (dès {{ minTravellers }} inscrits)
    </div>
  </v-row>
</template>

<script setup>
import { mdiAccountOutline } from '@mdi/js'

defineProps({
  status: {
    type: Object,
    required: true,
  },
  bookedPlaces: {
    type: Number,
    required: true,
  },
  maxTravellers: {
    type: Number,
    required: true,
  },
  minTravellers: {
    type: Number,
    default: 2,
  },
})
</script>
