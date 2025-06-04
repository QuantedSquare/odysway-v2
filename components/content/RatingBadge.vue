<template>
  <NuxtLink
    v-if="!noLink"
    :to="`#reviews-container`"
  >
    <v-btn
      v-if="rating"
      color="white"
      rounded="pill"
      :height="mdAndUp ? 46 : 30"
      class="btn-shadow bg-white px-2 px-md-4"
    >
      <div class="d-flex align-center ga-1">
        <v-img
          :src="img('/icons/yellow-star.svg', { format: 'webp', quality: 70, width: 640 })"
          alt="Rating star"
          :width="mdAndUp ? 18: 16"
          :height="mdAndUp ? 18 : 16"
        />
        <span class="text-body-2 mt-1 mt-md-0 font-weight-bold text-primary">
          {{ `${rating.toString().replace('.', ',')}/5` }}
        </span>
        <span
          v-if="comments > 0"
          class="text-body-2 mt-1 mt-md-0 font-weight-bold text-primary"
        >
          {{ `(${comments})` }}
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
  </NuxtLink>
  <div v-else>
    <v-btn
      v-if="rating"
      color="white"
      rounded="pill"
      :height="mdAndUp ? 46 : 30"
      class="btn-shadow bg-white px-2 px-md-4"
    >
      <div class="d-flex align-center ga-1">
        <v-img
          :src="img('/icons/yellow-star.svg', { format: 'webp', quality: 70, width: 640 })"
          alt="Rating star"
          :width="mdAndUp ? 18: 16"
          :height="mdAndUp ? 18 : 16"
        />
        <span class="text-body-2 mt-1 mt-md-0 font-weight-bold text-primary">
          {{ `${rating.toString().replace('.', ',')}/5` }}
        </span>
        <span
          v-if="comments > 0"
          class="text-body-2 mt-1 mt-md-0 font-weight-bold text-primary"
        >
          {{ `(${comments})` }}
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
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useImage } from '#imports'

const img = useImage()
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
  noLink: {
    type: Boolean,
    default: false,
  },
})
</script>
