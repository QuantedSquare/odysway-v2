<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
      :scroll-behavior="smAndDown ? 'hide' :'' "
      :scroll-threshold="5"
    />
    <ClientOnly>
      <Drawer v-model="drawer" />
    </ClientOnly>
    <v-main style="--v-layout-top: 90px; --v-layout-bottom: 0px;">
      <slot />
    </v-main>
    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div>
    <div
      id="Smallchat"
      class="d-none d-lg-inline"
    />
    <LazyTopTravelsTabs />
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const drawer = ref(false)
const { smAndDown } = useDisplay()
</script>

<style scoped>
.whatsapp-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
}
</style>
