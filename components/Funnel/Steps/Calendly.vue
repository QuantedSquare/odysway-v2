<template>
  <v-container>
    <div>
      {{ props.text }}
    </div>
    <div
      class="calendly-inline-widget"
      data-url="https://calendly.com/odysway/15min?hide_gdpr_banner=1"
      style="min-width: 320px; height: 700px;"
    />
  </v-container>
</template>

<script setup>
const props = defineProps({
  travelTitle: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
})
const calendly = useCalendly()
onMounted(() => {
  calendly.initInlineWidget()
})
useCalendlyEventListener({
  onEventScheduled: (event) => {
    console.log('Event scheduled:', event)
    // Pixel à mettre en place
    // this.$fb.query('trackCustom', 'RDVCalendlyPris', { voyage: props.travelTitle })
  },
})
onUnmounted(() => {
  // calendly.destroyInlineWidget()
})
</script>
