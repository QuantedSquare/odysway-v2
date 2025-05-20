<template>
  <v-app>
    <HeaderOdysway
      @show-drawer="toggleDrawer()"
    />
    <ClientOnly>
      <Drawer v-model="drawer" />
    </ClientOnly>
    <v-main style="--v-layout-top: 90px; --v-layout-bottom: 0px;">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const drawer = ref(false)

function toggleDrawer() {
  drawer.value = !drawer.value
}

onMounted(() => {
  const isConsent = localStorage.getItem('consent') === 'granted'

  if (isConsent) {
    trackPixel('track', 'PageView')
  }
})
</script>
