<template>
  <v-avatar
    :size="avatarSize"
    color="blue"
  >
    <v-img
      v-if="imgUrl"
      :src="imgUrl.srcUrl"
      :lazy-src="img(imgUrl.srcUrl, { format: 'webp', quality: 10, height: 340, width: 640 })"
      :alt="name + ' avatar'"
      height="100%"
      width="100%"
    />
    <span v-else> {{ name ? name[0].toUpperCase() : '' }}</span>
  </v-avatar>
</template>

<script setup>
import { buildImageUrl, useImage } from '#imports'

const { avatarImg } = defineProps({
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
const imgUrl = computed(() => {
  return buildImageUrl(avatarImg, null, 600)
})
</script>
