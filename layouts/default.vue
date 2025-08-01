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

    <v-main class="main-content mx-0 mx-md-5 px-1">
      <slot />
    </v-main>
    <div class="whatsapp-button mb-16">
      <WhatsAppBtn />
    </div>

    <v-container
      :fluid="width > 600"
      class="py-0 my-0 px-2 px-md-9"
    >
      <div
        v-if="route.path !== '/'"
        class="mx-1"
      >
        <ColorContainer
          color="grey-light-2"
        >
          <InfoContainer>
            <template #top>
              <AvatarsRowStack />
            </template>
            <template #title>
              {{ searchContent?.infoContainer?.title || 'Vous hésitez encore ?' }}
            </template>
            <template #description>
              {{ searchContent?.infoContainer?.description || 'Prenez un RDV avec un spécialiste qui vous conseillera selon vos envies.' }}
            </template>
            <template #bottom>
              <CtaButton
                color="secondary"
                link="/calendly"
              >
                <template #text>
                  {{ searchContent?.infoContainer?.buttonText || 'Prendre RDV' }}
                </template>
              </CtaButton>
            </template>
          </InfoContainer>
        </ColorContainer>
        <ColorContainer
          v-if="route.path !== '/avis-voyageurs'"
          color="white"
        >
          <CommonReviewContainer />
        </ColorContainer>
      </div>
      <ContentRenderer
        v-if="faqPage"
        :value="faqPage"
      />
      <div class="mx-1">
        <ColorContainer
          v-if="partenairesTextes"
          color="secondary"
          :white-text="true"
        >
          <InfoContainer :white-text="true">
            <template #title>
              {{ partenairesTextes?.layoutInfoContainer?.title }}
            </template>
            <template #description>
              {{ partenairesTextes?.layoutInfoContainer?.subtitle }}
            </template>
            <template #bottom>
              <PartenairesContainer />
            </template>
          </InfoContainer>
        </ColorContainer>
        <LazyTopTravelsTabs />
      </div>
    </v-container>
    <FooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const drawer = ref(false)
const route = useRoute()
const { data: faqPage } = await useAsyncData('faq-section', () => {
  return queryCollection('content')
    .path('/faq')
    .first()
})

const { data: partenairesTextes } = await useAsyncData('partenairesTextes', () => {
  return queryCollection('ctas').select('layoutInfoContainer', 'partenairesSection').first()
})

const { data: searchContent } = await useAsyncData('search-content', () =>
  queryCollection('page_search').first(),
)
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
