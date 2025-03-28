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
        <template
          v-for="column in columns"
          :key="column.key"
        >
          <th class="text-center text-uppercase text-h6">
            {{ column.title }}
          </th>
        </template>
      </tr>
    </template>
    <template #[`item.departureDate`]="{ item }">
      <div>
        {{ dayjs(item.departureDate).locale('fr').format('ddd DD/MM/YYYY') }}
      </div>
    </template>
    <template #[`item.returnDate`]="{ item }">
      <div>
        {{ dayjs(item.returnDate).locale('fr').format('ddd DD/MM/YYYY') }}
      </div>
    </template>
    <template #[`item.bookedPlaces`]="{ item }">
      <tr class="d-flex justify-end justify-lg-center">
        <div
          v-if="item.bookedPlaces < 2"
        >
          <span><v-icon> {{ mdiAccount }} </v-icon>Confirmé dès 2 inscrits</span>
        </div>
        <div
          v-else
          class="d-flex flex-column justify-center align-end align-lg-center ga-1"
        >
          <span> <v-icon>
            {{ mdiCheckCircleOutline }}
          </v-icon> Départ garanti confirmé</span>
          <span><v-icon>{{ mdiAccount }}</v-icon> {{ item.bookedPlaces }} inscrits - reste {{ item.maxTravellers - item.bookedPlaces }} places </span>
        </div>
      </tr>
    </template>
    <template #[`item.canBeBooked`]="{ item }">
      <tr class="d-flex justify-end justify-lg-center">
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
      </tr>
    </template>
  </v-data-table>
</template>

<script setup>
import { mdiAccount, mdiCheckCircleOutline } from '@mdi/js'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'

import { useDisplay } from 'vuetify'

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
  { title: 'RÉSERVER', key: 'canBeBooked' }]

const filteredDates = computed(() => {
  return [...props.deal.dates || []].filter(date => dayjs(date.departureDate).isAfter()).sort((a, b) => {
    return dayjs(a.departureDate).diff(dayjs(b.departureDate))
  })
})

const tableItems = computed(() => {
  return filteredDates.value.map((date) => {
    return {
      departureDate: date.departureDate,
      returnDate: date.returnDate,
      price: `${date.startingPrice || 0} €`,
      bookedPlaces: date.bookedPlaces || 0,
      maxTravellers: date.maxTravellers || 0,
      canBeBooked: date.maxTravellers !== date.bookedPlaces,
    }
  })
})

const formatLink = (date) => {
  const in30days = dayjs().add(30, 'day')
  const checkoutType = dayjs(date.departureDate).isBefore(in30days) ? 'full' : 'deposit'
  return `/checkout?slug=${props.deal.slug}&departure_date=${dayjs(date.departureDate).format('YYYY-MM-DD')}&return_date=${dayjs(date.returnDate).format('YYYY-MM-DD')}&type=${checkoutType}`
}
</script>
