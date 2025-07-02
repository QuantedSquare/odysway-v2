<template>
  <v-container>
    <div>
      {{ text }}
    </div>
    <ClientOnly>
      <CalendlyInlineWidget v-bind="options" />
    </ClientOnly>
  </v-container>
</template>

<script setup>
const props = defineProps({
  travelTitle: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: '',
  },
})
const options = {
  url: 'https://calendly.com/odysway/15min?hide_gdpr_banner=1',
}

useCalendlyEventListener({
  onEventScheduled: (_event) => {
    trackPixel('trackCustom', 'RDVCalendlyPris', { voyage: `RDVCalendlyPris: ${props.travelTitle}` })
  },
})
</script>
