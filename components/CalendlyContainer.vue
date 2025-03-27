<template>
  <v-container>
    <div :class="isCheckout ? '':'mt-16'">
      {{ text }}
    </div>
    <div
      class="calendly-inline-widget"
      data-url="https://calendly.com/odysway/15min?hide_gdpr_banner=1"
      style="min-width: 320px; height: 700px;"
    />
  </v-container>
</template>

<script setup>
const route = useRoute()

const isCheckout = computed(() => {
  return route.path.includes('checkout')
})

const text = 'Merci de votre confiance ! L\'aventure peut commencer ! Si vous le souhaitez, vous avez la possibilité de prendre un rendez-vous téléphonique avec l\'un de nos conseillers. Nous répondrons à toutes vos questions sur le voyage.'
const calendly = useCalendly()
onMounted(() => {
  calendly.initInlineWidget()
})
useCalendlyEventListener({
  onEventScheduled: (event) => {
    console.log('Event scheduled:', event)
    // Pixel à mettre en place
    // this.$fb.query('trackCustom', 'RDVCalendlyPris', { voyage: this.titre })
  },
})
</script>
