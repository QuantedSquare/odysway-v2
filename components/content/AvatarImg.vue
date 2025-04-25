<template>
  <v-avatar
    :image="avatarImg"
    :size="avatarSize"
  >
    <v-img
      :src="img(avatarImg, { format: 'webp', quality: 70, height: 340, width: 640 })"
      :lazy-src="img(avatarImg, { format: 'webp', quality: 10, height: 340, width: 640 })"
    />
  </v-avatar>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  avatarImg: {
    type: String,
    required: true,
  },
  avatarSize: {
    type: String,
    required: true,
  },
})

const img = useImage()
</script>
