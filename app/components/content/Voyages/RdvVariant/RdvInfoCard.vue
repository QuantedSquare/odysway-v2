<template>
  <v-card
    rounded="lg"
    class="rdv-info-card"
  >
    <v-card-text class="d-flex flex-column ga-3 pa-5">
      <div class="d-flex align-end justify-space-between ga-3">
        <div class="d-flex flex-column">
          <span class="text-caption text-grey">
            {{ stickyBlock.pricePrefix }}
          </span>
          <span class="text-h3 font-weight-bold text-primary">
            {{ voyage.pricing.startingPrice }}€<span class="text-body-2 font-weight-bold">{{ stickyBlock.priceSuffix }}</span>
          </span>
        </div>
        <RatingBadge :rating="voyage.rating" />
      </div>

      <v-btn-secondary
        height="52"
        block
        rounded="md"
        class="text-body-1 font-weight-bold text-decoration-none"
        @click="openRdv('info_card')"
      >
        {{ content.infoCard.rdvButtonText }}
      </v-btn-secondary>
      <p class="text-body-2 text-center text-primary-light-2 mb-0 reassure">
        {{ content.infoCard.reassureText }}
      </p>

      <v-divider />

      <v-btn
        height="48"
        block
        rounded="md"
        variant="outlined"
        color="primary"
        class="text-body-2 font-weight-bold"
        @click="scrollToDates('info_card')"
      >
        {{ content.infoCard.datesButtonText }}
      </v-btn>
      <div
        v-if="departuresLabel"
        class="d-flex align-center justify-center ga-2 text-caption text-primary-light-2"
      >
        <span class="status-dot" />
        {{ departuresLabel }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
const props = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
  stickyBlock: {
    type: Object,
    required: true,
  },
  content: {
    type: Object,
    required: true,
  },
  upcomingDates: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['scroll-to-dates'])
const { openRdv } = useRdvBooking()

const departuresLabel = computed(() => {
  const confirmed = props.upcomingDates.filter(date => date.status.status === 'confirmed').length
  if (confirmed > 0) return `${props.content.infoCard.guaranteedLabel} : ${confirmed}`
  const count = props.upcomingDates.length
  return count > 0 ? `${props.content.infoCard.scheduledLabel} : ${count}` : ''
})

function scrollToDates(position) {
  emit('scroll-to-dates', position)
}
</script>

<style scoped>
.rdv-info-card {
  box-shadow: 0 10px 30px rgba(9, 26, 30, 0.07) !important;
  border: 1px solid #DFE4E3;
}
.reassure {
  line-height: 1.5;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgb(var(--v-theme-green));
  flex: none;
}
</style>
