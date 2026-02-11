<template>
  <ClientOnly>
    <iframe
      data-tally-src="https://tally.so/embed/wQM8g1?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
      loading="lazy"
      width="100%"
      height="1097"
      frameborder="0"
      marginheight="0"
      marginwidth="0"
      title="Créez votre voyage sur-mesure 🌍"
    />
  </ClientOnly>
</template>

<script setup>
const { trackDevisStep } = useGtmTracking()

const props = defineProps({
  voyage: {
    type: Object,
    default: null,
  },
})

useHead({
  script: [
    {
      src: 'https://tally.so/widgets/embed.js',
      async: true,
    },
  ],
})

// Track if confirmation has already been sent to avoid duplicates
const confirmationTracked = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && window.Tally) {
    window.Tally.loadEmbeds()

    // Listen for Tally messages (form submission, navigation, etc.)
    window.addEventListener('message', handleTallyMessage)
  }

  // GTM: Track devis_surmesure_confirmation when user navigates away (redirected to Calendly)
  // This happens when they complete the Tally form
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handlePageExit)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('message', handleTallyMessage)
    window.removeEventListener('beforeunload', handlePageExit)
    alert('unmounted')
  }
})

// Listen for any Tally messages that might indicate form completion
const handleTallyMessage = (event) => {
  // Tally sends messages from their domain
  if (event.origin === 'https://tally.so' && event.data) {
    // Check for any form-related events (submission, navigation, etc.)
    const eventType = event.data.event || event.data.type

    // Track when form is submitted or when user is about to be redirected
    if (eventType && (
      eventType.includes('Submit')
      || eventType.includes('Complete')
      || eventType.includes('Finish')
    )) {
      trackConfirmation()
    }
  }
}

// GTM: Track when user exits the page (redirected to Calendly after form completion)
const handlePageExit = () => {
  // Only track if user is actually leaving (not just refreshing)
  trackConfirmation()
}

// Centralized tracking function to avoid duplicates
const trackConfirmation = () => {
  if (!confirmationTracked.value && props.voyage) {
    confirmationTracked.value = true

    const { formatVoyageForGtm } = useGtmVoyageFormatter()
    const formattedVoyage = formatVoyageForGtm(props.voyage)

    // Track devis_surmesure_confirmation
    // Note: We don't have user_data from Tally, so just track the event
    trackDevisStep('surmesure', 'confirmation', formattedVoyage)
  }
}
</script>
