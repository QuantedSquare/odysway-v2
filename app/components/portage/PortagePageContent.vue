<template>
  <div>
    <LazyBottomAppBar
      :hydrate-on-idle="true"
      :date-sections="page.dateSections"
      :starting-price="voyage.pricing.startingPrice"
      :no-group-travel="false"
      :slug="voyage.slug.current"
    />

    <v-container
      fluid
      class="py-0 my-0 px-3 px-md-4"
    >
      <HeroVoyageSection :voyage="voyage" />
      <LazyChipsContainer
        :hydrate-on-idle="true"
        :badges="voyage.badges"
        :badge-title="voyage.experienceType?.badgeTitle"
        :difficulty-level="voyage.difficultyLevel"
        :level-badge-order="voyage.levelBadgeOrder"
      />
      <!-- <LazySubHeaderMobileCTABar
        :hydrate-on-idle="true"
        :date-sections="page.dateSections"
        :starting-price="voyage.pricing.startingPrice"
        :no-group-travel="!voyage.availabilityTypes?.includes('groupe')"
        :slug="voyage.slug.current"
      /> -->
      <v-divider class="d-block d-md-none" />
      <StickyContainer>
        <template #left-side>
          <LazyAuthorNote
            :author-note="voyage.authorNote"
            :page="page"
          />

          <LazyHighlightsContainer
            :experiences-block="voyage.experiencesBlock"
            :page="page.experiencesBlock"
          />

          <LazyProgrammeContainer :programme-block="voyage.programmeBlock" />

          <LazyAccompanistsContainer
            :voyage="voyage"
            :title="page.accompanistsTitle"
          />
        </template>
        <template #right-side>
          <InfoCard
            :sticky-block="page.stickyBlock"
            :voyage="voyage"
          />
        </template>
      </StickyContainer>

      <v-container
        fluid
        class="px-0"
      >
        <LazyHousingSection
          :housing-block="voyage.housingBlock"
          :housing-title="page.housingTitle"
          :housing-type-title="page.housingTypeTitle"
          :housing-mood-title="page.housingMoodTitle"
        />

        <LazyDatesPricesContainer
          :closing-days="voyage.closingDays"
          :sticky-block="page.stickyBlock"
          :date-sections="page.dateSections"
          :is-groupe-available="true"
          :is-privatisation-available="false"
          :last-minute-price="voyage.pricing.lastMinuteReduction"
          :early-bird-price="voyage.pricing.earlyBirdReduction || 0"
          :voyage="voyage"
          :indiv-section="page.indivSection"
        />

        <LazyPriceDetailsContainer
          :pricing-details-block="voyage.pricingDetailsBlock"
          :price-details-section="page.priceDetailsSection"
        />
        <LazyReviewCarousel :reviews-section="page.reviewsSection" />

        <LazyFaqVoyagesContainer
          :background-image="voyage.image"
          :faq-block="voyage.faqBlock"
          :static-faq="page.faqSection.faqBlock"
        />
      </v-container>
    </v-container>
  </div>
</template>

<script setup>
// Corps de la page d'un séjour en portage (/portage/<slug>). Partagé avec
// l'aperçu de l'Espace porteur (/espace-porteur/apercu/<id>), qui le nourrit du
// brouillon du porteur : les deux affichent exactement les mêmes composants.
defineProps({
  voyage: {
    type: Object,
    required: true,
  },
  page: {
    type: Object,
    required: true,
  },
})
</script>
