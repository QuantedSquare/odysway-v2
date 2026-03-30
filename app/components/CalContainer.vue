<template>
  <v-container :class="route.path === '/devis' || route.path.startsWith('/checkout') ? '' : 'cal-container'">
    <div>
      {{ text }}
    </div>
    <div
      id="cal-inline-embed"
      style="width: 100%; height: 100%; overflow: scroll"
    />
    <div v-if="isFunnel">
      <v-btn
        class="bg-grey-light font-weight-regular"
        @click="emit('previous')"
      >
        Précédent
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
const route = useRoute()
const { trackReservationRdvStep, trackRdvStep, trackDevisStep, getCountryFromPhone } = useGtmTracking()
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
    default: 'checkout',
  },
  calLink: {
    type: String,
    default: 'petit-oni/15and30min',
  },
})
const emit = defineEmits(['previous'])

const isDevisContext = computed(() => props.funnelType === 'devis' || route.path === '/devis')

const { init, onLinkReady, onBookingSuccess, onNavigatedToBooker } = useCalEmbed()

let hasTrackedStep2 = false

onMounted(async () => {
  const calNs = await init('odysway', props.calLink, '#cal-inline-embed', {
    useSlotsViewOnSmallScreen: 'true',
  })

  onLinkReady(calNs, () => {
    // GTM: Track when Cal.com widget is loaded (equivalent to Calendly step 1)
    if (props.isFunnel && props.voyage) {
      const formattedVoyage = formatVoyageForGtm(props.voyage)

      if (isDevisContext.value) {
        trackDevisStep('rdv', 1, formattedVoyage)
      }
      else {
        trackReservationRdvStep(1, formattedVoyage)
      }
    }
  })

  onNavigatedToBooker(calNs, () => {
    // GTM: Track when user reaches the booking form (equivalent to Calendly date/time selected)
    if (hasTrackedStep2) return
    hasTrackedStep2 = true

    if (props.isFunnel && props.voyage) {
      const formattedVoyage = formatVoyageForGtm(props.voyage)

      if (isDevisContext.value) {
        trackDevisStep('rdv', 2, formattedVoyage)
      }
      else {
        trackReservationRdvStep(2, formattedVoyage)
      }
    }
    else {
      trackRdvStep(1)
    }
  })

  onBookingSuccess(calNs, (data) => {
    // Extract user data from Cal.com booking payload
    const userData = {}

    if (data?.booking) {
      const booking = data.booking
      const attendees = booking?.attendees || booking?.responses

      if (attendees) {
        const attendee = Array.isArray(attendees) ? attendees[0] : attendees
        userData.user_mail = attendee?.email || booking?.responses?.email || ''
        userData.user_phone = attendee?.phone || booking?.responses?.phone || ''
        userData.user_name = attendee?.name || booking?.responses?.name || ''
        userData.user_country = getCountryFromPhone(userData.user_phone)
      }
    }

    // GTM: Track booking confirmation
    if (props.isFunnel && props.voyage) {
      const formattedVoyage = formatVoyageForGtm(props.voyage)

      if (isDevisContext.value) {
        trackDevisStep('rdv', 'confirmation', formattedVoyage, userData)
      }
      else {
        trackReservationRdvStep('confirmation', formattedVoyage, userData)
      }
    }
    else {
      trackRdvStep('confirmation', userData)
    }
  })
})
</script>

<style scoped>
@media screen and (min-width: 1440px) {
.cal-container {
  width: 1440px;
}
}
</style>
