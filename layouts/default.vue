<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
    />
    <ClientOnly>
      <Drawer v-model="drawer" />
    </ClientOnly>
    <v-main>
      <slot />
    </v-main>
    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div>
    <div
      id="Smallchat"
      class="d-none d-lg-block"
    />
    <FooterOdysway />
  </v-app>
</template>

<script setup>
const drawer = ref(false)
</script>

<style scoped>
.whatsapp-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
}
</style>
