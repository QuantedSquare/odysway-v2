<template>
  <v-img
    :src="heroContent.imgSrc"
    cover
    height="100vh"
  >
    <span class="position-absolute font-weight-bold text-h3 text-white ">{{ heroContent.text }}</span>
  </v-img>
</template>

<script setup>
const heroContent
  = {
    imgSrc: '/images/IMG_20250101_161727_049.jpg',
    text: 'Banner text',
  }
</script>

<style scoped>
.position-absolute {
  position: absolute;
  bottom: 20%;
  left: 10%;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, .3);
}
</style>
