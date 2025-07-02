<template>
  <v-row
    class="text-body-1 my-md-2 "
    align="center"
    no-gutters
    role="listitem"
    :aria-label="`${isIncluded ? 'Inclus' : 'Non inclus'}: ${text}`"
  >
    <v-col
      cols="12"
      class="d-flex ga-2 font-weight-regular"
    >
      <v-icon :class="isIncluded ? 'text-green' : 'text-secondary'">
        {{ isIncluded ? mdiCheckCircleOutline : mdiCloseCircleOutline }}
      </v-icon>
      <span v-dompurify-html="parseBoldText(text)" />
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
  text: {
    type: String,
    default: '',
  },
})
</script>
