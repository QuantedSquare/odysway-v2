<template>
  <v-container
    fluid
    class="pa-0 ma-0 mb-4"
  >
    <v-card
      elevation="2"
      rounded="xl"
      class="text-grey-darken-2 overflow-hidden"
    >
      <v-img
        v-if="imgSrc"
        height="140"
        width="100%"
        :src="imgSrc"
        :lazy-src="imgSrc"
        :alt="`Paysage pour ${voyage?.title}`"
        cover
        class="text-white"
      >
        <div class="img-overlay" />
        <div class="d-flex flex-column justify-end h-100 pa-4 position-relative">
          <span class="text-body-2 font-weight-medium custom-line-height">{{ voyage?.title }}</span>
          <span class="text-white-70">
            {{ subtitle }}
          </span>
        </div>
      </v-img>

      <v-card-text class="px-5 py-4">
        <div class="text-overline font-weight-regular">
          Tarif indicatif à partir de
        </div>
        <div class="text-h5 font-weight-bold text-primary">
          {{ formattedPrice }}
        </div>
        <div class="text-caption font-weight-regular">
          /pers · ajusté selon votre projet
        </div>

        <v-divider class="my-3" />

        <div class="d-flex flex-column ga-2 text-subtitle-2 font-weight-regular">
          <div class="d-flex align-center ga-2">
            <v-icon
              size="15"
              color="primary"
            >
              {{ mdiCheckCircle }}
            </v-icon>
            <span><strong>4,8/5</strong> · +800 avis voyageurs</span>
          </div>
          <div class="d-flex align-center ga-2">
            <v-icon
              size="15"
              color="primary"
            >
              {{ mdiCheckCircle }}
            </v-icon>
            <span>Annulation gratuite jusqu'à <strong>J-60</strong></span>
          </div>
          <div class="d-flex align-center ga-2">
            <v-icon
              size="15"
              color="primary"
            >
              {{ mdiCheckCircle }}
            </v-icon>
            <span>Conseillère dédiée à votre projet</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { mdiCheckCircle } from '@mdi/js'
import formatNumber from '@/utils/formatNumber'

const props = defineProps({
  voyage: {
    type: Object,
    required: true,
  },
  details: {
    type: Object,
    default: () => ({}),
  },
})

const imgSrc = computed(() => {
  return getImageUrl(props.voyage?.image?.asset?._ref) || '/images/default/Odysway-couverture-mongolie.jpeg'
})

const formattedPrice = computed(() => {
  const price = +props.voyage?.pricing?.startingPrice * 100
  if (!price) return '—'
  return formatNumber(price, 'currency', 'EUR')
})

const subtitle = computed(() => {
  const types = props.voyage?.availabilityTypes || []
  const parts = []
  if (types.includes('privatisation')) parts.push('Voyage privatif')
  else if (types.includes('groupe')) parts.push('Voyage en groupe')
  else parts.push(props.voyage?.travelType || 'Voyage individuel')
  if (types.includes('custom')) parts.push('sur mesure')
  return parts.join(' · ')
})
</script>

<style scoped>
.img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0) 100%);
}
.text-white-70 {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12.5px;
}
.custom-line-height {
  line-height: 1.2;
}
</style>
