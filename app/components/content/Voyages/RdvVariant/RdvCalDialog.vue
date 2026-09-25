<template>
  <v-dialog
    :model-value="dialog.open"
    :fullscreen="smAndDown"
    max-width="1000"
    scrollable
    @update:model-value="value => !value && closeRdv()"
  >
    <v-card rounded="lg">
      <div class="d-flex align-center justify-space-between px-4 pt-3">
        <span class="text-subtitle-1 font-weight-bold text-primary">
          {{ title }}
        </span>
        <v-btn
          :icon="mdiClose"
          variant="text"
          aria-label="Fermer"
          @click="closeRdv()"
        />
      </div>
      <v-card-text class="pa-0 cal-wrapper">
        <div
          v-if="dialog.open"
          :id="elementId"
          :key="elementId"
          class="cal-embed"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { mdiClose } from '@mdi/js'
import { useDisplay } from 'vuetify'
import { stegaClean } from '@sanity/client/stega'
import { AB_TEST_NAME } from '~/utils/rdvVariant'

const props = defineProps({
  calLink: {
    type: String,
    default: 'odysway/rendez-vous',
  },
  voyage: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: 'Choisissez votre créneau',
  },
})

const { smAndDown } = useDisplay()
const { dialog, closeRdv } = useRdvBooking()
const { init, onBookingSuccess, onNavigatedToBooker } = useCalEmbed()
const { trackAbEvent, trackRdvStep, getCountryFromPhone } = useGtmTracking()
const { getLeadSource } = useLeadSource()

// Un namespace Cal par ouverture : l'embed inline ne se ré-initialise pas
// proprement sur un nœud recréé dans le même namespace.
let openCount = 0
const elementId = ref('rdv-cal-embed-0')

function buildCalConfig(slot) {
  const { platform, params } = getLeadSource()
  const config = {
    'useSlotsViewOnSmallScreen': 'true',
    // Pré-remplit la question obligatoire « À propos de quel voyage… » de l'event type.
    'voyage': stegaClean(props.voyage.title || ''),
    // Métadonnées enregistrées sur la réservation Cal.com (visibles dans le booking et
    // dans les webhooks) : d'où vient le lead et depuis quelle variante il a réservé.
    'metadata[voyage]': stegaClean(props.voyage.slug?.current || ''),
    'metadata[voyage_title]': stegaClean(props.voyage.title || ''),
    'metadata[ab_test]': AB_TEST_NAME,
    'metadata[ab_variant]': 'B',
    'metadata[cta_position]': dialog.value.position || '',
    'metadata[lead_source]': platform || '',
  }
  // Cal.com rattache nativement les utm_* de l'URL à la réservation.
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith('utm_') && value) config[key] = value
  }
  if (slot) {
    // Ouvre directement le formulaire sur le créneau cliqué.
    const date = new Date(slot)
    const day = slot.slice(0, 10)
    config.month = day.slice(0, 7)
    config.date = day
    config.slot = date.toISOString()
  }
  return config
}

watch(() => dialog.value.open, async (open) => {
  if (!open) return
  openCount += 1
  elementId.value = `rdv-cal-embed-${openCount}`
  await nextTick()

  const position = dialog.value.position
  const calNs = await init(`rdv-voyage-${openCount}`, props.calLink, `#${elementId.value}`, buildCalConfig(dialog.value.slot))

  let hasTrackedBooker = false
  onNavigatedToBooker(calNs, () => {
    if (hasTrackedBooker) return
    hasTrackedBooker = true
    trackRdvStep(1)
  })

  onBookingSuccess(calNs, (data) => {
    const booking = data?.booking
    const attendee = Array.isArray(booking?.attendees) ? booking.attendees[0] : booking?.attendees
    const userData = {
      user_mail: attendee?.email || booking?.responses?.email || '',
      user_phone: attendee?.phone || booking?.responses?.phone || booking?.responses?.attendeePhoneNumber || '',
      user_name: attendee?.name || booking?.responses?.name || '',
    }
    userData.user_country = getCountryFromPhone(userData.user_phone)

    // La conversion du test : le rendez-vous pris, pas le clic sur le bouton.
    trackAbEvent('rdv_scheduled', { ab_test: AB_TEST_NAME, position })
    // Conversion RDV historique, pour que les balises Meta / GA4 existantes suivent.
    trackRdvStep('confirmation', userData)
  })
})
</script>

<style scoped>
.cal-wrapper {
  min-height: 70vh;
}
.cal-embed {
  width: 100%;
  min-height: 70vh;
  overflow: auto;
}
</style>
