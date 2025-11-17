<template>
  <v-app>
    <TopBar />
    <v-main class="main-content mx-0 mx-md-5">
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
</script>

<style scoped>
.main-content {
  --v-layout-top: 90px!important;
  --v-layout-bottom: 0px;
}
@media (max-width: 960px) {
  .main-content {
    --v-layout-top: 60px!important;
  }
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  padding-bottom: var(--v-layout-bottom)!important;
}
</style>
