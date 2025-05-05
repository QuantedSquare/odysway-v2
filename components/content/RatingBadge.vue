<template>
  <v-btn
    v-if="rating"
    color="white"
    rounded="pill"
    :height="mdAndUp ? 46 : 36"
    class="btn-shadow"
  >
    <div class="d-flex align-center mt-1">
      <v-icon
        :icon="mdiStar"
        color="yellow-rating"
        :size="mdAndUp ? 20 : 16"
        class="mb-1"
      />
      <span class="text-body-2 font-weight-bold text-primary">
        {{ `${rating.toString().replace('.', ',')}/5` }}
      </span>
    </div>
  </v-btn>
  <v-btn
    v-else
    color="primary"
    class="font-weight-bold btn-shadow text-body-2 text-md-body-1"
    rounded="pill"
    :height="mdAndUp ? 46 : 36"
  >
    <span class="mt-1">
      Nouveau
    </span>
  </v-btn>
</template>

<script setup>
import { mdiStar } from '@mdi/js'
import { useDisplay } from 'vuetify'

const { mdAndUp } = useDisplay()

defineProps({
  rating: {
    type: Number,
  },
  elevation: {
    type: String,
    default: '0',
  },
})
</script>
