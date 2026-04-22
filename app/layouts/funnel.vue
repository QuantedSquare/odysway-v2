<template>
  <v-app>
    <FunnelLayoutHeader />
    <v-main class="main-content bg-warm">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
</script>

<style scoped>
.main-content {
  --v-layout-bottom: 0px;
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  padding-bottom: var(--v-layout-bottom)!important;
}
</style>
