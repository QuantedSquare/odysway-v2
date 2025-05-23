<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
    />
    <ClientOnly>
      <LazyDrawer
        v-if="width < 960"
        v-model="drawer"
      />
    </ClientOnly>

    <v-main style="--v-layout-top: 90px; --v-layout-bottom: 0px;">
      <slot />
    </v-main>
    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div> -->
    <LazyTopTravelsTabs />
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
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
