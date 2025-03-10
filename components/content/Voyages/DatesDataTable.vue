<template>
  <v-data-table
    hide-default-footer
    :headers="headers"
    :items="filteredDates"
    class="bg-primary"
  >
    <template #headers="{ columns }">
      <tr>
        <template
          v-for="column in columns"
          :key="column.key"
        >
          <th class="text-center text-uppercase">
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
        <td>
          <div v-if="item.bookedPlaces < 2">
            <v-icon>
              {{ mdiAccount }}
            </v-icon> Confirmé dès 2 inscrits
          </div>
          <div
            v-else
          >
            <v-icon>
              {{ mdiCheckCircleOutline }}
            </v-icon> <span>Départ garanti</span>
            <p>Confirmé</p>
            <v-icon>{{ mdiAccount }}</v-icon> {{ item.bookedPlaces }} inscrits - reste {{ item.maxTravellers - item.bookedPlaces }} places
          </div>
        </td>
        <td>
          <div v-if="item.maxTravellers !== item.bookedPlaces">
            <v-btn-secondary
              :to="`/checkout?slug=${deal.slug}&departure_date=${dayjs(item.departureDate).format('YYYY-MM-DD')}&return_date=${dayjs(item.returnDate).format('YYYY-MM-DD')}&type=deposit`"
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
console.log(filteredDates.value)
</script>
