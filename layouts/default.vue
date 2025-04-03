<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
    />
    <ClientOnly>
      <Drawer v-model="drawer" />
    </ClientOnly>
    <v-main style="--v-layout-top: 0px; --v-layout-bottom: 0px;">
      <slot />
    </v-main>
    <CookiesSnackbar />
    <FooterOdysway />
  </v-app>
</template>

<script setup>
const drawer = ref(false)
</script>
