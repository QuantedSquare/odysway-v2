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
    <FooterOdysway />
  </v-app>
</template>

<script setup>
const drawer = ref(false)

function toggleDrawer() {
  drawer.value = !drawer.value
}
</script>
