<template>
  <v-app>
    <TopBar />

    <v-main class="main-content mx-0 mx-md-5 custom-margin-x mb-0 ">
      <!-- <SiteBanner /> -->
      <slot />
    </v-main>
  
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
</script>

<style scoped>
.main-content {
  --v-layout-top: 90px!important;
  --v-layout-bottom: 0px !important;
  max-width: 1440px;
  padding-bottom: 0px!important;
}
@media (max-width: 960px) {
  .main-content {
    --v-layout-top: 60px!important;
  }
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
}
@media (min-width: 1600px) {
.custom-margin-x{
    margin-left: auto!important;
    margin-right: auto!important;
  }
}
</style>
