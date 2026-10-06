<template>
  <v-app>
    <!-- Pas de SiteBanner : le bandeau promo B2C ne s'adresse pas au public de
         ces pages. Le hero passe sous le header transparent (cf. HeaderOdysway). -->
    <TopBar />

    <v-main class="main-content">
      <slot />
    </v-main>
    <div class="whatsapp-button mb-16">
      <WhatsAppBtn />
    </div>

    <LazyFooterOdysway :hydrate-on-visible="{ rootMargin: '400px' }" />
  </v-app>
</template>

<style scoped>
.main-content {
  --v-layout-top: 0px!important;
  --v-layout-bottom: 0px;
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  padding-bottom: var(--v-layout-bottom)!important;
}
</style>
