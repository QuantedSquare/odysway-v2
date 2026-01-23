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

onMounted(() => {
  if (typeof window !== 'undefined' && window.Tally) {
    window.Tally.loadEmbeds()

    // Listen for Tally form completion (if supported)
    // Tally form emits messages when submitted
    window.addEventListener('message', handleTallyMessage)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('message', handleTallyMessage)
  }
})

// GTM: Track Tally form submission via postMessage API
const handleTallyMessage = (event) => {
  // Tally sends messages from their domain
  if (event.origin === 'https://tally.so' && event.data?.event === 'Tally.FormSubmitted') {
    // Track devis_surmesure_confirmation when form is submitted
    if (props.voyage) {
      const { formatVoyageForGtm } = useGtmVoyageFormatter()
      const formattedVoyage = formatVoyageForGtm(props.voyage)

      // Note: We don't have user_data from Tally, so just track the event
      trackDevisStep('surmesure', 'confirmation', formattedVoyage)
    }
  }
}
</script>
