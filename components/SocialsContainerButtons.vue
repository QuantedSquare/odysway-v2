<template>
  <div class="d-flex justify-space-around">
    <v-btn
      icon
      size="small"
      color="#4267B2"
      href="https://www.facebook.com/odysway/"
    >
      <v-icon>{{ mdiFacebook }}</v-icon>
    </v-btn>
    <v-btn
      icon
      size="small"
      color="rgb(209, 32, 218)"
      href="https://www.instagram.com/odysway_travel/"
    >
      <v-icon>{{ mdiInstagram }}</v-icon>
    </v-btn>
    <v-btn
      icon
      size="small"
      color="#ce1312"
      href="https://www.youtube.com/channel/UCsc9xUf1MF4-yDGs4ftkT2g"
    >
      <v-icon>{{ mdiYoutube }}</v-icon>
    </v-btn>
    <v-btn
      icon
      size="small"
      color="#007ebb"
      href="https://linkedin.com/company/odysway"
    >
      <v-icon>{{ mdiLinkedin }}</v-icon>
    </v-btn>
    <v-btn
      icon
      size="small"
      color="#E60023"
      href="https://www.pinterest.fr/odyswaytravel/"
    >
      <v-icon>{{ mdiPinterest }}</v-icon>
    </v-btn>
    <v-btn
      icon
      size="small"
      color="#69C9D0"
      href="https://www.tiktok.com/@odyswaytravel"
    >
      <v-img
        :src="img('/icons/IcRoundTiktok.svg', { format: 'webp', quality: 70 })"
        width="24px"
        height="24px"
        contain
      />
    </v-btn>
  </div>
</template>

<script setup>
import { mdiFacebook, mdiInstagram, mdiYoutube, mdiLinkedin, mdiPinterest } from '@mdi/js'
import { useImage } from '#imports'

const img = useImage()
</script>
