<template>
  <v-app>
    <HeaderOdysway
      @show-drawer="toggleDrawer()"
    />
    <ClientOnly>
      <Drawer v-model="drawer" />
    </ClientOnly>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const drawer = ref(false)

function toggleDrawer() {
  drawer.value = !drawer.value
}
</script>
