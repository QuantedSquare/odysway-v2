<template>
  <v-data-table
    hide-default-footer
    :mobile="mdAndDown"
    :headers="headers"
    :items="filteredDates"
    class="bg-primary rounded-lg py-4  font-weight-bold"
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
    <template #item="{ item }">
      <tr class="text-center">
        <td>
          {{ dayjs(item.departureDate).locale('fr').format('ddd DD/MM/YYYY') }}
        </td>
        <td>{{ dayjs(item.returnDate).locale('fr').format('ddd DD/MM/YYYY') }}</td>
        <td>{{ item.startingPrice }} €</td>
        <td class="text-start d-flex flex-column align-center">
          <div
            v-if="item.bookedPlaces < 2"
            class="d-flex justify-center align-center h-100"
          >
            <v-icon>
              {{ mdiAccount }}
            </v-icon>
            <span>Confirmé dès 2 inscrits</span>
          </div>
          <div
            v-else
            class="d-flex flex-column justify-center align-center ga-1"
          >
            <div>
              <v-icon>
                {{ mdiCheckCircleOutline }}
              </v-icon>
              <span>Départ garanti confirmé</span>
            </div>
            <div>
              <v-icon>{{ mdiAccount }}</v-icon> {{ item.bookedPlaces }} inscrits - reste {{ item.maxTravellers - item.bookedPlaces }} places
            </div>
          </div>
        </td>
        <td>
          <div v-if="item.maxTravellers !== item.bookedPlaces">
            <v-btn-secondary
              :to="formatLink(item)"
              class="text-caption text-uppercase"
            >
              réserver / poser une option
            </v-btn-secondary>
          </div>
          <div v-else>
            plus de places disponibles
          </div>
        </td>
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

const { mdAndDown } = useDisplay()
dayjs.extend(customParseFormat)

const props = defineProps({
  deal: {
    type: Object,
    required: true,
  },
})
console.log(props.deal)
const headers = [{
  title: 'date départ',
  key: 'date départ',
},
{ title: 'date retour', key: 'calodate retourries' },
{ title: 'prix', key: 'prix' },
{ title: 'état', key: 'état' },
{ title: 'réserver', key: 'réserver' }]

const filteredDates = computed(() => {
  return [...props.deal.dates].filter(date => dayjs(date.departureDate).isAfter())
})

const formatLink = (date) => {
  const in30days = dayjs().add(30, 'day')
  const checkoutType = dayjs(date.departureDate).isBefore(in30days) ? 'full' : 'deposit'
  return `/checkout?slug=${props.deal.slug}&departure_date=${dayjs(date.departureDate).format('YYYY-MM-DD')}&return_date=${dayjs(date.returnDate).format('YYYY-MM-DD')}&type=${checkoutType}`
}
console.log(filteredDates.value)
</script>
