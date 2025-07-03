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
})
const emit = defineEmits(['previous'])
const options = {
  url: 'https://calendly.com/odysway/15min?hide_gdpr_banner=1',
}

useCalendlyEventListener({
  onEventScheduled: (event) => {
    trackPixel('trackCustom', 'RDVCalendlyPris', { voyage: `RDVCalendlyPris: ${props.travelTitle}` })
  },
})
</script>
