<template>
  <div class="d-flex justify-center">
    <v-btn
      v-if="!external"
      :to="link"
      :color="color"
      height="62"
      size="large"
      class="text-decoration-none"
      :target="external ? '_blank' : undefined"
      :rel="external ? 'noopener noreferrer' : undefined"
      @click="handleClick"
    >
      <div
        class="text-body-1 font-weight-bold mx-4"
        :class="`text-${textColor}`"
      >
        <slot
          mdc-unwrap="p"
          name="text"
        />
      </div>
    </v-btn>
    <v-btn
      v-else
      :href="link"
      :color="color"
      height="62"
      size="large"
    >
      <div class="text-white text-decoration-none text-body-1 font-weight-bold mx-4">
        <slot
          mdc-unwrap="p"
          name="text"
        />
      </div>
    </v-btn>
  </div>
</template>

<script setup>
const props = defineProps({
  link: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
  textColor: {
    type: String,
    default: 'white',
  },
  external: {
    type: Boolean,
    default: false,
  },
  ctaId: {
    type: String,
    default: null,
  },
  ctaLabel: {
    type: String,
    default: null,
  },
})

const { gtag } = useGtag()
const { trackRdvClick, trackCtaClick } = useGtmTracking()

function captureOutboundLink(btn) {
  gtag('event', 'Header Button', { eventAction: 'Click', eventLabel: `CTA button "${btn}"` })
}

const handleClick = () => {
  // Track RDV click if link contains calendly or rdv keywords
  if (props.link.includes('calendly') || props.link.toLowerCase().includes('rdv')) {
    trackRdvClick()
  }
  
  // Track generic CTA click
  if (props.ctaId || props.ctaLabel) {
    trackCtaClick({
      ctaId: props.ctaId || `cta-${props.link}`,
      ctaLabel: props.ctaLabel || props.link,
      ctaUrl: props.link,
    })
  }
  
  // Keep existing tracking
  trackPixel('trackCustom', 'ClickRDV')
  captureOutboundLink(props.link)
}
</script>
