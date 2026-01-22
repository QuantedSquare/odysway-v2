<template>
  <v-btn
    href="https://wa.me/+33780919540"
    icon
    rounded="circle"
    height="58"
    width="58"
    color="white"
    @click="handleWhatsappClick"
  >
    <img
      src="/icons/whatsapp_logo_icon_186881.svg"
      alt="whatsapp"
      width="58"
      height="58"
    >
  </v-btn>
</template>

<script setup>
const { trackWhatsappClick } = useGtmTracking()

const handleWhatsappClick = () => {
  trackWhatsappClick()
}
</script>
