<template>
  <v-avatar
    :size="avatarSize"
    color="blue"
  >
    <SanityImage
      v-if="avatarImg"
      :asset-id="avatarImg.asset._ref"
      auto="format"
    >
      <template #default="{ src }">
        <v-img
          :src="img(src, { format: 'webp', quality: 70, height: 340, width: 640 })"
          :lazy-src="img(src, { format: 'webp', quality: 10, height: 340, width: 640 })"
          :alt="name + ' avatar'"
          height="100%"
          width="100%"
        />
      </template>
    </SanityImage>
    <span v-else> {{ name ? name[0].toUpperCase() : '' }}</span>
  </v-avatar>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  avatarImg: {
    type: Object,
    default: null,
  },
  avatarSize: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: null,
  },
})

const img = useImage()
</script>
