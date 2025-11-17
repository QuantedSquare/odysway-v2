<template>
  <v-app>
    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

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
