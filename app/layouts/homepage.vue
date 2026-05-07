<template>
  <v-app>
    <TopBar />

    <v-main class="main-content">
      <slot />
    </v-main>
    <div class="whatsapp-button mb-16">
      <WhatsAppBtn />
    </div>
    <v-container
      v-once
      fluid
      class="py-0 my-0 px-2 px-md-9"
    >
      <div
        v-if="route.path !== '/'"
        class="mx-1"
      >
        <ClientOnly>
          <LazyColorContainer
            :hydrate-on-visible="{ rootMargin: '400px' }"
            color="grey-light-2"
          >
            <LazyInfoContainer>
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
                  cta-id="homepage-layout-rdv-bottom"
                  :cta-label="searchContent?.infoContainer?.buttonText || 'Prendre RDV'"
                >
                  <template #text>
                    {{ searchContent?.infoContainer?.buttonText || 'Prendre RDV' }}
                  </template>
                </CtaButton>
              </template>
            </LazyInfoContainer>
          </LazyColorContainer>
        </ClientOnly>
        <ColorContainer
          v-if="route.path !== '/avis-voyageurs'"
          color="white"
        >
          <CommonReviewContainer />
        </ColorContainer>
      </div>

      <LazyFaqContainer :hydrate-on-visible="{ rootMargin: '400px' }" />

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
        <LazyTopTravelsTabs :hydrate-on-visible="{ rootMargin: '400px' }" />
      </div>
    </v-container>
    <LazyFooterOdysway :hydrate-on-visible="{ rootMargin: '400px' }" />
  </v-app>
</template>

<script setup>
const route = useRoute()

const partenairesQuery = groq`*[_type == "ctas"][0]{
  layoutInfoContainer,
  partenairesSection
}`

const searchQuery = groq`*[_type == "search"][0]{
  infoContainer
}`

// lazy + below-the-fold: don't block SSR. Both feed sections gated by
// `v-if="data"` so a late arrival just renders when ready.
const { data: partenairesTextes } = useSanityQuery(partenairesQuery, undefined, { lazy: true })
const { data: searchContent } = useSanityQuery(searchQuery, undefined, { lazy: true })
</script>

<style scoped>
.main-content {
  --v-layout-top: 0px!important;
  --v-layout-bottom: 0px;
}
@media (max-width: 960px) {
  .main-content {
    --v-layout-top: 0!important;
  }
}

:deep(.v-main) {
  padding-top: var(--v-layout-top)!important;
  padding-bottom: var(--v-layout-bottom)!important;
}
</style>
