<template>
  <v-container>
    <div>
      {{ text }}
    </div>
    <!-- <div
      class="calendly-inline-widget"
      data-url="https://calendly.com/odysway/15min?hide_gdpr_banner=1"
      style="min-width: 320px; height: 700px;"
    /> -->
    <CalendlyInlineWidget v-bind="options" />
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

// const calendly = useCalendly()
// onMounted(() => {
//   calendly.initInlineWidget()
//   console.log(props.travelTitle)
// })
useCalendlyEventListener({
  onEventScheduled: (event) => {
    console.log('Event scheduled:', event)
    // Pixel à mettre en place
    // this.$fb.query('trackCustom', 'RDVCalendlyPris', { voyage: travelTitle })
  },
})
// onUnmounted(() => {
//   calendly.destroyInlineWidget()
// })
</script>
