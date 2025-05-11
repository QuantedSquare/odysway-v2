<template>
  <div class="d-flex justify-space-around">
    <v-btn
      :icon="mdiFacebook"
      rounded="circle"
      size="small"
      color="primary"
      href="https://www.facebook.com/odysway/"
    />
    <v-btn
      :icon="mdiInstagram"
      rounded="circle"
      size="small"
      color="primary"
      href="https://www.instagram.com/odysway_travel/"
    />
    <v-btn
      icon
      size="small"
      rounded="circle"
      color="primary"
      href="https://www.tiktok.com/@odyswaytravel"
    >
      <v-img
        :src="img('/icons/IcRoundTiktok.svg', { format: 'webp', quality: 70, width: 640 })"
        width="24px"
        height="24px"
        contain
        alt="TikTok icon"
      />
    </v-btn>
  </div>
</template>

<script setup>
import { mdiFacebook, mdiInstagram } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()
</script>
