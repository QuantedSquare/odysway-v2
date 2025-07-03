<template>
  <v-container :class="route.path === '/devis' || route.path === '/checkout' ? '' : 'calendly-container'">
    <div>
      {{ text }}
    </div>
    <ClientOnly>
      <CalendlyInlineWidget v-bind="options" />
    </ClientOnly>
  </v-container>
</template>

<script setup>
const route = useRoute()

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

<style scoped>
@media screen and (min-width: 1440px) {
.calendly-container {
  width: 1440px;
}
}
</style>
