<template>
  <v-app>
    <HeaderOdysway
      v-model="drawer"
    />
    <ClientOnly>
      <LazyDrawer
        v-if="width < 960"
        v-model="drawer"
      />
    </ClientOnly>
    <v-main class="main-content mx-0 mx-md-5 custom-margin-x mb-0">
      <slot />
    </v-main>

    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div>

    <v-container
      :fluid="width > 600"
      class="py-0 my-0 px-2 px-md-9"
    >
      <LazyTopTravelsTabs />
    </v-container>
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const drawer = ref(false)
</script>

<style scoped>
.whatsapp-button {
  position: fixed;
  bottom: -60px;
  right: 5px;
  z-index: 10000;
}

.main-content {
  --v-layout-top: 90px!important;
  --v-layout-bottom: 0px;
  max-width: 1440px;
  padding-bottom: 0px!important;
}
@media (max-width: 960px) {
  .main-content {
    --v-layout-top: 60px!important;
  }
  .whatsapp-button {
  position: fixed;
  bottom: 10px;
  right: 30px;
  z-index: 10000;
}
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  /* padding-bottom: var(--v-layout-bottom)!important; */

}
@media (min-width: 1600px) {
.custom-margin-x{
    margin-left: auto!important;
    margin-right: auto!important;
  }
}
</style>
