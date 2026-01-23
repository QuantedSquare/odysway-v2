<template>
  <v-container :class="route.path === '/devis' || route.path === '/checkout' ? '' : 'calendly-container'">
    <div>
      {{ text }}
    </div>
    <CalendlyInlineWidget v-bind="options" />
    <div v-if="isFunnel">
      <v-btn
        class="
        bg-grey-light font-weight-regular"
        @click="emit('previous')"
      >
        Précédent
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
const route = useRoute()
const { trackReservationRdvStep, trackRdvStep, trackDevisStep } = useGtmTracking()
const { formatVoyageForGtm } = useGtmVoyageFormatter()

const props = defineProps({
  travelTitle: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
  isFunnel: {
    type: Boolean,
    default: false,
  },
  voyage: {
    type: Object,
    default: null,
  },
  funnelType: {
    type: String,
    default: 'checkout', // 'checkout' or 'devis'
  },
})
const emit = defineEmits(['previous'])
const options = {
  url: 'https://calendly.com/odysway/15min?hide_gdpr_banner=1',
}

// Determine if we're in devis context
const isDevisContext = computed(() => props.funnelType === 'devis' || route.path === '/devis')

// GTM: Track when Calendly widget is mounted
onMounted(() => {
  if (props.isFunnel && props.voyage) {
    const formattedVoyage = formatVoyageForGtm(props.voyage)

    if (isDevisContext.value) {
      // Devis RDV context: devis_rdv_step1
      trackDevisStep('rdv', 1, formattedVoyage)
    }
    else {
      // Checkout RDV context: reservation_rdv_step1
      trackReservationRdvStep(1, formattedVoyage)
    }
  }
  else {
    // Standalone context: rdv_step1
    trackRdvStep(1)
  }
})

useCalendlyEventListener({
  onDateAndTimeSelected: (_event) => {
    // GTM: Track when date/time is selected in Calendly
    if (props.isFunnel && props.voyage) {
      const formattedVoyage = formatVoyageForGtm(props.voyage)

      if (isDevisContext.value) {
        // Devis RDV context: devis_rdv_step2
        trackDevisStep('rdv', 2, formattedVoyage)
      }
      else {
        // Checkout RDV context: reservation_rdv_step2
        trackReservationRdvStep(2, formattedVoyage)
      }
    }
    // Note: Standalone RDV doesn't have a step2 in the CSV
  },
  onEventScheduled: (_event) => {
    trackPixel('trackCustom', 'RDVCalendlyPris', { voyage: `RDVCalendlyPris: ${props.travelTitle}` })

    // GTM: Track when RDV is confirmed
    if (props.isFunnel && props.voyage) {
      const formattedVoyage = formatVoyageForGtm(props.voyage)

      if (isDevisContext.value) {
        // Devis RDV context: devis_rdv_confirmation
        trackDevisStep('rdv', 'confirmation', formattedVoyage)
      }
      else {
        // Checkout RDV context: reservation_rdv_confirmation
        trackReservationRdvStep('confirmation', formattedVoyage)
      }
    }
    else {
      // Standalone context: rdv_confirmation
      trackRdvStep('confirmation')
    }
  },
})
</script>

<style scoped>
@media screen and (min-width: 1440px) {
.calendly-container {
  width: 1440px;
}
}
</style>
