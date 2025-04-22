<template>
  <v-col
    cols="12"
    sm="4"
    md="3"
  >
    <NuxtLink
      :to="`/thematiques/${slug}`"
    >
      <v-card>
        <v-img
          :src="imgComp(image, { format: 'webp', quality: 70, width: 640 })"
          class="align-end"
          height="228px"
          cover
        >
          <v-card-title
            class="text-white text-center font-weight-bold text-shadow"
          >{{ title }}</v-card-title>
        </v-img>
      </v-card>
    </NuxtLink>
  </v-col>
</template>

<script setup>
import { useImage } from '#imports'

const imgComp = useImage()

defineProps({
  slug: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>
