<template>
  <v-app>
    <HeaderOdysway
      :scroll-behavior="$vuetify.display.smAndDown ? 'hide' :'' "
      scroll-threshold="5"
      @show-drawer="toggleDrawer()"
    />
    <ClientOnly>
      <Drawer v-model="drawer" />
    </ClientOnly>
    <v-main style="--v-layout-top: 0px; --v-layout-bottom: 0px;">
      <slot />
    </v-main>
    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div>
    <div
      id="Smallchat"
      class="d-none d-lg-inline"
    />
    <FooterOdysway />
  </v-app>
</template>

<script setup>
const drawer = ref(false)

function toggleDrawer() {
  drawer.value = !drawer.value
}
</script>

<style scoped>
.whatsapp-button {
  position: fixed;
  bottom: 10px;
  right: 10px;
  z-index: 1000;
}
</style>
