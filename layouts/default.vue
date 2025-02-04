<template>
  <v-app>
    <HeaderAppBar />
    <v-main>
      <slot />
    </v-main>
    <v-footer>
      Footer
    </v-footer>
  </v-app>
</template>

<script setup>
import HeaderAppBar from '~/components/HeaderAppBar.vue'
</script>
