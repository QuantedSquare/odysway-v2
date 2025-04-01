<template>
  <v-data-table
    :mobile="smAndDown"
    hide-default-footer
    :headers="headers"
    :items="tableItems"
    class="bg-primary text-center py-4 font-weight-bold"
    :class="deal.privatisation ? 'rounded-lg' : 'rounded-b-lg'"
  >
    <template #headers="{ columns }">
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          class="text-center text-uppercase text-h6"
        >
          {{ column.title }}
        </th>
      </tr>
    </template>

    <template #[`item.departureDate`]="{ item }">
      <div>{{ formatDate(item.departureDate) }}</div>
    </template>

    <template #[`item.returnDate`]="{ item }">
      <div>{{ formatDate(item.returnDate) }}</div>
    </template>

    <template #[`item.price`]="{ item }">
      <div
        v-if="hasPromotion(item)"
      >
        <PromoChip>{{ getPromotionLabel(item) }}</PromoChip>
        <div>{{ getDiscountedPrice(item) }} €</div>
        <div class="text-decoration-line-through">
          {{ item.price }} €
        </div>
      </div>
      <div v-else>
        <div>{{ item.price }} €</div>
      </div>
    </template>

    <template #[`item.bookedPlaces`]="{ item }">
      <div class="d-flex justify-end justify-lg-center">
        <div v-if="item.bookedPlaces < 2">
          <span>
            <v-icon>{{ mdiAccount }}</v-icon>
            Confirmé dès 2 inscrits
          </span>
        </div>
        <div
          v-else
          class="d-flex flex-column justify-center align-end align-lg-center ga-1"
        >
          <span>
            <v-icon>{{ mdiCheckCircleOutline }}</v-icon>
            Départ garanti confirmé
          </span>
          <span>
            <v-icon>{{ mdiAccount }}</v-icon>
            {{ item.bookedPlaces }} inscrits - reste {{ item.maxTravellers - item.bookedPlaces }} places
          </span>
        </div>
      </div>
    </template>

    <template #[`item.canBeBooked`]="{ item }">
      <div class="d-flex justify-end justify-lg-center">
        <v-btn-secondary
          v-if="item.canBeBooked"
          :to="formatLink(item)"
          class="text-caption text-uppercase"
          max-width="250"
        >
          réserver / poser une option
        </v-btn-secondary>
        <div v-else>
          plus de places disponibles
        </div>
      </div>
    </template>
  </v-data-table>
</template>

<script setup>
import { mdiAccount, mdiCheckCircleOutline } from '@mdi/js'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'
import { useDisplay } from 'vuetify'
import PromoChip from '~/components/PromoChip.vue'

const { smAndDown } = useDisplay()
dayjs.extend(customParseFormat)

const props = defineProps({
  deal: {
    type: Object,
    required: true,
  },
})

const headers = [
  { title: 'DATE DE DÉPART', key: 'departureDate' },
  { title: 'DATE RETOUR', key: 'returnDate' },
  { title: 'PRIX', key: 'price' },
  { title: 'ÉTAT', key: 'bookedPlaces' },
  { title: 'RÉSERVER', key: 'canBeBooked' },
]

const formatDate = (date) => {
  return dayjs(date).locale('fr').format('ddd DD/MM/YYYY')
}

const hasPromotion = (item) => {
  return item.promoEarlyBird || item.lastMinute
}

const getPromotionLabel = (item) => {
  return item.promoEarlyBird ? 'Tarif Early Bird' : 'Tarif Last Minute'
}

const getDiscountedPrice = (item) => {
  if (item.promoEarlyBird) {
    return item.price - item.promoEarlyBird
  }
  if (item.lastMinute) {
    return item.price - item.promoLastMinute
  }
  return item.price
}

const filteredDates = computed(() => {
  return [...props.deal.dates || []]
    .filter(date => dayjs(date.departureDate).isAfter())
    .sort((a, b) => dayjs(a.departureDate).diff(dayjs(b.departureDate)))
})

const tableItems = computed(() => {
  return filteredDates.value.map(date => ({
    departureDate: date.departureDate,
    returnDate: date.returnDate,
    price: date.startingPrice || 0,
    bookedPlaces: date.bookedPlaces || 0,
    maxTravellers: date.maxTravellers || 0,
    canBeBooked: date.maxTravellers !== date.bookedPlaces,
    earlyBird: date.earlyBird,
    promoEarlyBird: date.promoEarlyBird || 0,
    lastMinute: date.lastMinute,
    promoLastMinute: date.promoLastMinute || 0,
  }))
})

const formatLink = (date) => {
  const in30days = dayjs().add(30, 'day')
  const checkoutType = dayjs(date.departureDate).isBefore(in30days) ? 'full' : 'deposit'
  return `/checkout?slug=${props.deal.slug}&departure_date=${dayjs(date.departureDate).format('YYYY-MM-DD')}&return_date=${dayjs(date.returnDate).format('YYYY-MM-DD')}&type=${checkoutType}`
}
</script>
