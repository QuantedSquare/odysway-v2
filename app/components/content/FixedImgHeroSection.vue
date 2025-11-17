<template>
  <div>
    <SanityImage
      :asset-id="imgSrc.asset._ref"
      auto="format"
    >
      <template #default="{ src }">
        <v-img
          class="img-couv hidden-md-and-down"
          :src="src"
          :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
        />
      </template>
    </SanityImage>

    <SanityImage
      :asset-id="imgSrcMobile.asset._ref"
      auto="format"
    >
      <template #default="{ src }">
        <v-img
          class="img-couv hidden-md-and-up"
          :src="src"
          :lazy-src="img(src, { format: 'webp', quality: 10, height: 900, width: 1536 })"
        />
      </template>
    </SanityImage>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

defineProps({
  imgSrc: {
    type: Object,
    required: true,
  },
  imgSrcMobile: {
    type: Object,
    required: true,
  },
})
const img = useImage()
</script>
