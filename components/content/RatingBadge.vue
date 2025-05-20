<template>
  <v-btn
    v-if="rating"
    color="white"
    rounded="pill"
    :height="mdAndUp ? 46 : 36"
    class="btn-shadow"
  >
    <div class="d-flex align-center">
      <v-icon
        :icon="mdiStar"
        color="yellow-rating"
        :size="mdAndUp ? 20 : 16"
      />
      <span class="text-body-2 font-weight-bold text-primary">
        {{ `${rating.toString().replace('.', ',')}/5` }}
      </span>
      <span
        v-if="comments > 0"
        class="text-subtitle-2 font-weight-bold text-primary"
      >
        {{ `&nbsp;( ${comments} )` }}
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
    <span>
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
  comments: {
    type: Number,
    default: 0,
  },
})
</script>
