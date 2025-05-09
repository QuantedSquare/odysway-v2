<template>
  <div class="d-flex align-center ga-3 font-weight-bold">
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
        class="font-weight-regular"
      >
        - Reste {{ maxTravellers - bookedPlaces }} places
      </span>
    </div>
    <div
      v-else
      class="font-weight-regular"
    >
      (dès 2 inscrits)
    </div>
  </div>
</template>

<script setup>
import { mdiAccountOutline } from '@mdi/js'

defineProps({
  status: {
    type: Object,
    required: true,
    validator: (value) => {
      return ['soon_confirmed', 'confirmed', 'guaranteed'].includes(value.status)
        && typeof value.text === 'string'
        && typeof value.color === 'string'
    },
  },
  bookedPlaces: {
    type: Number,
    required: true,
  },
  maxTravellers: {
    type: Number,
    required: true,
  },
})
</script>
