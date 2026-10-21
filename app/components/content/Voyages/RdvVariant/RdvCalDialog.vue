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
const { init, preload, onLinkReady, onLinkFailed, onBookingSuccess, onNavigatedToBooker } = useCalEmbed()
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

// Au-delà, l'ouverture est comptée en échec (rdv_calendar_failed) ; le calendrier
// peut encore s'afficher ensuite, rdv_calendar_ready part alors avec sa durée.
const CALENDAR_TIMEOUT_MS = 8000

// Ouverture en cours, suivie jusqu'à la fermeture de la fenêtre. step : dernière
// étape atteinte (chargement → calendrier → confirme), envoyée avec rdv_modal_close.
// Cal.com n'émet pas d'événement public au choix d'un créneau.
let current = null

const elapsed = opening => Math.round(performance.now() - opening.startedAt)

function trackCalendarFailed(opening, reason, code = null) {
  if (opening.hasFailed) return
  opening.hasFailed = true
  trackAbEvent('rdv_calendar_failed', {
    ab_test: AB_TEST_NAME,
    position: opening.position,
    reason,
    ...(code && { error_code: code }),
    duration_ms: elapsed(opening),
  })
}

function endOpening() {
  if (!current) return
  clearTimeout(current.timeoutId)
  trackAbEvent('rdv_modal_close', {
    ab_test: AB_TEST_NAME,
    position: current.position,
    last_step: current.step,
    duration_ms: elapsed(current),
  })
  current = null
}

watch(() => dialog.value.open, async (open) => {
  if (!open) {
    endOpening()
    return
  }
  openCount += 1
  elementId.value = `rdv-cal-embed-${openCount}`

  const position = dialog.value.position
  const opening = { position, startedAt: performance.now(), step: 'chargement', hasFailed: false }
  current = opening
  opening.timeoutId = setTimeout(() => {
    if (opening.step === 'chargement') trackCalendarFailed(opening, 'timeout')
  }, CALENDAR_TIMEOUT_MS)

  await nextTick()
  const calNs = await init(`rdv-voyage-${openCount}`, props.calLink, `#${elementId.value}`, buildCalConfig(dialog.value.slot))

  onLinkReady(calNs, () => {
    if (opening.step !== 'chargement') return
    opening.step = 'calendrier'
    clearTimeout(opening.timeoutId)
    trackAbEvent('rdv_calendar_ready', { ab_test: AB_TEST_NAME, position, duration_ms: elapsed(opening) })
  })

  onLinkFailed(calNs, (data) => {
    clearTimeout(opening.timeoutId)
    trackCalendarFailed(opening, 'link_failed', data?.code)
  })

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
    opening.step = 'confirme'

    // La conversion du test : le rendez-vous pris, pas le clic sur le bouton.
    trackAbEvent('rdv_scheduled', { ab_test: AB_TEST_NAME, position })
    // Conversion RDV historique, pour que les balises Meta / GA4 existantes suivent.
    trackRdvStep('confirmation', userData)
  })
})

// Préchargement de Cal.com au premier geste du visiteur (scroll, toucher), puis
// quand le navigateur est au repos : rien n'est téléchargé pour qui repart sans
// interagir, et le chargement de la page n'est pas concurrencé.
const INTERACTION_EVENTS = ['scroll', 'pointerdown', 'keydown']
let idleHandle = null

function schedulePreload() {
  removeInteractionListeners()
  const run = () => preload(stegaClean(props.calLink))
  idleHandle = 'requestIdleCallback' in window
    ? { idle: window.requestIdleCallback(run, { timeout: 3000 }) }
    : { timer: setTimeout(run, 1000) }
}

function removeInteractionListeners() {
  for (const event of INTERACTION_EVENTS) window.removeEventListener(event, schedulePreload)
}

onMounted(() => {
  for (const event of INTERACTION_EVENTS) window.addEventListener(event, schedulePreload, { once: true, passive: true })
})

onBeforeUnmount(() => {
  removeInteractionListeners()
  if (idleHandle?.idle) window.cancelIdleCallback(idleHandle.idle)
  if (idleHandle?.timer) clearTimeout(idleHandle.timer)
  endOpening()
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
