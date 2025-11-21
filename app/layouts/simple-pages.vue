<template>
  <v-app>
    <TopBar />

    <v-main class="main-content mx-0 mx-md-5 px-1">
      <slot />
    </v-main>
    <div class="whatsapp-button mb-16">
      <WhatsAppBtn />
    </div>

    <v-container :fluid="width > 600" class="py-0 my-0 px-2 px-md-9">
      <div class="mx-1">
        <ColorContainer color="white">
          <CommonReviewContainer />
        </ColorContainer>
      </div>
      <LazyFaqContainer />
      <div class="mx-1">
        <ColorContainer v-if="pageTextes" color="secondary" :white-text="true">
          <InfoContainer :white-text="true">
            <template #title>
              {{ pageTextes?.layoutInfoContainer?.title }}
            </template>
            <template #description>
              {{ pageTextes?.layoutInfoContainer?.subtitle }}
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

const pageTextesQuery = groq`*[_type == "ctas"][0]{
  layoutInfoContainer
}`
const sanity = useSanity()
const { data: pageTextes } = await useAsyncData('page-textes-layouts', () =>
  sanity.fetch(pageTextesQuery),
)
</script>

<style scoped>
.main-content {
  --v-layout-top: 90px !important;
  --v-layout-bottom: 0px;
}

@media (max-width: 960px) {
  .main-content {
    --v-layout-top: 60px !important;
  }
}

:deep(.v-main) {
  padding-top: var(--v-layout-top) !important;
  padding-bottom: var(--v-layout-bottom) !important;
}
</style>
