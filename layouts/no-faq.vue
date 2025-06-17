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

    <v-main class="main-content mx-0 mx-md-5">
      <slot />
    </v-main>
    <div class="whatsapp-button d-lg-none mb-16">
      <WhatsAppBtn />
    </div>
    <!-- End FAQ Section -->    <!-- Info Section -->
    <v-container
      :fluid="width > 600"
      class="py-0 my-0 px-2 px-md-9"
    >
      <ColorContainer
        v-if="status === 'success'"
        color="secondary"
        :white-text="true"
      >
        <InfoContainer :white-text="true">
          <template #title>
            {{ partenairesTextes?.partenairesSection?.title }}
          </template>
          <template #description>
            {{ partenairesTextes?.partenairesSection?.subtitle }}
          </template>
          <template #bottom>
            <PartenairesContainer />
          </template>
        </InfoContainer>
      </ColorContainer>
      <LazyTopTravelsTabs />
    </v-container>
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const drawer = ref(false)
const { data: partenairesTextes, status } = useAsyncData('partenairesTextes', () => {
  return queryCollection('ctas').select('partenairesSection').first()
})
</script>

<style scoped>
.whatsapp-button {
  position: fixed;
  bottom: -55px;
  right: 15px;
  z-index: 10000;
}

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
