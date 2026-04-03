<template>
  <v-app-bar
    location="bottom"
    class="d-md-none pb-sm-0 bottom-app-bar mx-0"
  >
    <v-container class="px-3">
      <v-row
        no-gutters
        class="px-0"
      >
        <v-col
          cols="5"
          class="d-flex flex-column align-start justify-center"
        >
          <template v-if="startingPrice > 0">
            <span class="text-caption text-grey">
              {{ dateSections.pricePrefix }}
            </span>
            <span class="text-h4 font-weight-bold text-primary">
              {{ startingPrice }}€<span class="text-caption">{{ dateSections.priceSuffix }}</span>
            </span>
          </template>
        </v-col>
        <v-spacer class="d-block" />
        <v-col
          cols="6"
          class="d-flex align-center justify-end"
        >
          <v-btn-secondary
            density="compact"
            height="50"
            rounded="md"
            color="primary"
            class="text-body-2 font-weight-bold text-decoration-none"
            @click="handleClick"
          >
            {{ noGroupTravel ? 'Demander un devis' : dateSections.bookingButtonText }}
          </v-btn-secondary>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useGoTo } from 'vuetify'

const goTo = useGoTo()
const { trackCtaClick } = useGtmTracking()

const props = defineProps({
  dateSections: {
    type: Object,
    required: true,
  },
  startingPrice: {
    type: Number,
    default: 0,
  },
  noGroupTravel: {
    type: Boolean,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
})

const handleClick = () => {
  if (props.noGroupTravel) {
    trackCtaClick({ ctaId: 'bottom-bar-devis', ctaLabel: 'Demander un devis', ctaUrl: `/devis?slug=${props.slug}` })
    navigateTo(`/devis?slug=${props.slug}`)
  }
  else {
    trackCtaClick({ ctaId: 'bottom-bar-book', ctaLabel: props.dateSections.bookingButtonText, ctaUrl: '#dates-container' })
    goTo('#dates-container', { offset: -200 })
  }
}
</script>

<style scoped>
.bottom-app-bar{
  z-index: 1020 !important;
  width: 100% !important;
}
</style>
