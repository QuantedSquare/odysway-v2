<template>
  <v-avatar
    :image="avatarImg"
    :size="avatarSize"
    color="blue"
  >
    <v-img
      v-if="avatarImg.length > 0"
      :src="img(avatarImg, { format: 'webp', quality: 70, height: 340, width: 640 })"
      :lazy-src="img(avatarImg, { format: 'webp', quality: 10, height: 340, width: 640 })"
    />
    <span v-else> {{ name ? name[0].toUpperCase() : '' }}</span>
  </v-avatar>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  avatarImg: {
    type: String,
    required: false,
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
