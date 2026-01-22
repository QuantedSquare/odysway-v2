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
      :fluid="width > 600"
      class="py-0 my-0 px-2 px-md-9"
    >
      <div
        v-if="route.path !== '/'"
        class="mx-1"
      >
        <ClientOnly>
          <LazyColorContainer
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

      <LazyFaqContainer />

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
    <LazyFooterOdysway />
  </v-app>
</template>

<script setup>
import { useDisplay } from 'vuetify'

const { width } = useDisplay()
const route = useRoute()
const sanity = useSanity()

const partenairesQuery = groq`*[_type == "ctas"][0]{
  layoutInfoContainer,
  partenairesSection
}`

const searchQuery = groq`*[_type == "search"][0]{
  infoContainer
}`

const { data: partenairesTextes } = await useAsyncData(
  'partenairesTextes',
  async () => {
    try {
      const result = await sanity.fetch(partenairesQuery)
      return result || null
    }
    catch (e) {
      console.error('Error fetching partenaires:', e)
      return null
    }
  },
  {
    server: true,
  },
)

const { data: searchContent } = await useAsyncData(
  'search-content',
  async () => {
    try {
      const result = await sanity.fetch(searchQuery)
      return result || null
    }
    catch (e) {
      console.error('Error fetching search content:', e)
      return null
    }
  },
  {
    server: true,
  },
)
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
