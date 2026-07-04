<template>
  <v-app>
    <TopBar />

    <v-main class="main-content">
      <SiteBanner />
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
     <v-container
    class="rounded-lg py-md-8 px-0  px-md-8 mt-4 mt-md-8 max-container-width">
    <LazyHomeFaqSection
      :hydrate-on-visible="{ rootMargin: '400px' }"
    />
</v-container>
     <!-- Texte SEO bas de page (homepage uniquement), juste au-dessus du footer -->
    <LazySeoTextBlock
      :data="homeSeoText?.seoText"
      :hydrate-on-visible="{ rootMargin: '400px' }"
    />
      <div class="mx-1">
      
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

// Homepage SEO text block (rendered just above the footer). seoText is a plain
// object (title + portable-text content), so the spread brings everything.
const seoTextQuery = groq`*[_type == "homePage"][0]{
  seoText
}`

// lazy + below-the-fold: don't block SSR. Both feed sections gated by
// `v-if="data"` so a late arrival just renders when ready.
const { data: partenairesTextes } = useSanityQuery(partenairesQuery, undefined, { lazy: true })
const { data: searchContent } = useSanityQuery(searchQuery, undefined, { lazy: true })
const { data: homeSeoText } = useSanityQuery(seoTextQuery, undefined, { lazy: true })
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
