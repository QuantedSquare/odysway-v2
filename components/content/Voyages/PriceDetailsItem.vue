<template>
  <v-row
    class="text-body-1 text-grey-darken-3 my-2"
    align="center"
    no-gutters
  >
    <v-col cols="1">
      <v-icon :class="isIncluded ? 'text-green' : 'text-secondary'">
        {{ isIncluded ? mdiCheckCircleOutline : mdiCloseCircleOutline }}
      </v-icon>
    </v-col>
    <v-col cols="11">
      <slot
        name="item"
      />
    </v-col>
  </v-row>
</template>

<script setup>
import { mdiCheckCircleOutline, mdiCloseCircleOutline } from '@mdi/js'

const { isIncluded } = defineProps({
  isIncluded: {
    type: Boolean,
    default: false,
  },
})
</script>
