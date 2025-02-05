<template>
  <div class="d-flex justify-space-around my-4">
    <VBtnSocial
      color="#4267B2"
      href="https://www.facebook.com/odysway/"
    >
      <v-icon>{{ mdiFacebook }}</v-icon>
    </VBtnSocial>
    <VBtnSocial
      color="rgb(209, 32, 218)"
      href="https://www.instagram.com/odysway_travel/"
    >
      <v-icon>{{ mdiInstagram }}</v-icon>
    </VBtnSocial>
    <VBtnSocial
      color="#ce1312"
      href="https://www.youtube.com/channel/UCsc9xUf1MF4-yDGs4ftkT2g"
    >
      <v-icon>{{ mdiYoutube }}</v-icon>
    </VBtnSocial>
    <VBtnSocial
      color="#007ebb"
      href="https://linkedin.com/company/odysway"
    >
      <v-icon>{{ mdiLinkedin }}</v-icon>
    </VBtnSocial>
    <VBtnSocial
      color="#E60023"
      href="https://www.pinterest.fr/odyswaytravel/"
    >
      <v-icon>{{ mdiPinterest }}</v-icon>
    </VBtnSocial>
    <VBtnSocial
      color="#69C9D0"
      href="https://www.tiktok.com/@odyswaytravel"
    >
      <v-img
        src="/icons/IcRoundTiktok.svg"
        width="24px"
        height="24px"
        contain
      />
    </VBtnSocial>
  </div>
</template>

<script setup>
import { mdiFacebook, mdiInstagram, mdiYoutube, mdiLinkedin, mdiPinterest } from '@mdi/js'
</script>
