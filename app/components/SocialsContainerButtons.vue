<template>
  <div class="d-flex justify-space-around">
    <v-btn
      icon
      rounded="circle"
      size="38"
      href="https://www.facebook.com/odysway/"
      aria-label="Suivre Odysway sur Facebook"
      @click="() => handleSocialClick('Facebook')"
    >
      <v-img
        :src="img('/icons/IcFacebook.svg', { format: 'webp', quality: 70, width: 640 })"
        width="9"
        height="17"
        alt="Facebook icon"
      />
    </v-btn>
    <v-btn
      icon
      rounded="circle"
      size="38"
      href="https://www.tiktok.com/@odyswaytravel"
      aria-label="Suivre Odysway sur TikTok"
      @click="() => handleSocialClick('TikTok')"
    >
      <v-img
        :src="img('/icons/IcTiktok.svg', { format: 'webp', quality: 70, width: 640 })"
        width="20"
        height="17"
        alt="TikTok icon"
      />
    </v-btn>
    <v-btn
      icon
      rounded="circle"
      size="38"
      href="https://www.instagram.com/odysway_travel/"
      aria-label="Suivre Odysway sur Instagram"
      @click="() => handleSocialClick('Instagram')"
    >
      <v-img
        :src="img('/icons/IcInstagram.svg', { format: 'webp', quality: 70, width: 640 })"
        width="17"
        height="17"
        contain
        alt="Instagram icon"
      />
    </v-btn>
  </div>
</template>

<script setup>
import { useImage } from '#imports'

const img = useImage()
const { trackSocialMediaClick } = useGtmTracking()

const handleSocialClick = (socialMedia) => {
  trackSocialMediaClick(socialMedia)
}
</script>
