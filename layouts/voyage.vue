<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
      :scroll-behavior="$vuetify.display.smAndDown ? 'hide' :'' "
      scroll-threshold="5"
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
</script>
