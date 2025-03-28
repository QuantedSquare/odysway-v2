<template>
  <ClientOnly>
    <v-data-table
      v-if="deal"
      :mobile="smAndDown"
      hide-default-footer
      :headers="headers"
      :items="tableItems"
      :loading="loading"
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
      <template #[`item.bookedPlaces`]="{ item }">
        <div class="d-flex justify-end justify-lg-center">
          <div
            v-if="item.bookedPlaces < 2"
          >
            <span class="d-flex align-center ga-1"><v-icon> {{ mdiAccount }} </v-icon>Confirmé dès 2 inscrits</span>
          </div>
          <div
            v-else
            class="d-flex flex-column justify-center align-end align-lg-center ga-1 text-caption"
          >
            <span class="font-weight-bold"> <v-icon>
              {{ mdiCheckCircleOutline }}
            </v-icon> Départ garanti confirmé</span>
            <span><v-icon>{{ mdiAccount }}</v-icon> {{ item.bookedPlaces }} inscrits - reste {{ item.maxTravellers - item.bookedPlaces }} places </span>
          </div>
        </div>
      </template>
      <template #[`item.canBeBooked`]="{ item }">
        <div class="d-flex justify-end justify-lg-center">
          <v-btn-secondary
            v-if="item.canBeBooked"
            :to="urls[getItemKey(item)] || '#'"
            :loading="!urls[getItemKey(item)]"
            :disabled="!urls[getItemKey(item)]"
            class="text-caption text-uppercase"
            max-width="250"
          >
            {{ !urls[getItemKey(item)] ? 'Chargement...' : 'réserver' }}
            {{ !item.canPlaceOption ? '/ poser une option' : '' }}
          </v-btn-secondary>
          <div v-else>
            plus de places disponibles
          </div>
        </div>
      </template>

      <template #bottom>
        <div
          v-if="error"
          class="text-error pa-4"
        >
          Une erreur est survenue lors de la génération des liens
        </div>
      </template>
    </v-data-table>
  </ClientOnly>
</template>

<script setup>
import { mdiAccount, mdiCheckCircleOutline } from '@mdi/js'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import 'dayjs/locale/fr'
import { useDisplay } from 'vuetify'
import { useSecureUrl } from '~/composables/useSecureUrl'

const { smAndDown } = useDisplay()
dayjs.extend(customParseFormat)

const props = defineProps({
  deal: {
    type: Object,
    required: true,
  },
})

const loading = ref(false)
const urls = ref({})
const error = ref(null)

const headers = [
  { title: 'DATE DE DÉPART', key: 'departureDate' },
  { title: 'DATE RETOUR', key: 'returnDate' },
  { title: 'PRIX', key: 'price' },
  { title: 'ÉTAT', key: 'bookedPlaces' },
  { title: 'RÉSERVER', key: 'canBeBooked' },
]

const filteredDates = computed(() => {
  return [...props.deal.dates || []].filter(date => dayjs(date.departureDate).isAfter()).sort((a, b) => {
    return dayjs(a.departureDate).diff(dayjs(b.departureDate))
  })
})

const tableItems = computed(() => {
  return filteredDates.value.map((date) => {
    const formattedDepartureDate = dayjs(date.departureDate).locale('fr').format('ddd DD/MM/YYYY')
    const formattedReturnDate = dayjs(date.returnDate).locale('fr').format('ddd DD/MM/YYYY')

    return {
      departureDate: formattedDepartureDate,
      returnDate: formattedReturnDate,
      price: `${date.startingPrice || 0} €`,
      bookedPlaces: date.bookedPlaces || 0,
      maxTravellers: date.maxTravellers || 0,
      canBeBooked: date.maxTravellers !== date.bookedPlaces,
      canPlaceOption: dayjs(date.departureDate).isBefore(dayjs().add(30, 'day')),
      rawDepartureDate: date.departureDate,
      rawReturnDate: date.returnDate,
    }
  })
})

const getItemKey = (item) => {
  const departureDateKey = dayjs(item.rawDepartureDate).format('YYYY-MM-DD')
  const returnDateKey = dayjs(item.rawReturnDate).format('YYYY-MM-DD')
  return `${departureDateKey}-${returnDateKey}`
}

onMounted(async () => {
  loading.value = true
  error.value = null
  const { generateSecureUrl } = useSecureUrl()

  try {
    for (const item of tableItems.value) {
      const departureDateFormatted = dayjs(item.rawDepartureDate).format('YYYY-MM-DD')
      const returnDateFormatted = dayjs(item.rawReturnDate).format('YYYY-MM-DD')
      const key = `${departureDateFormatted}-${returnDateFormatted}`

      try {
        const params = {
          slug: props.deal.slug,
          departure_date: departureDateFormatted,
          return_date: returnDateFormatted,
          type: dayjs(item.rawDepartureDate).isBefore(dayjs().add(30, 'day')) ? 'full' : 'deposit',
          step: 1,
        }

        const url = await generateSecureUrl(params)
        urls.value[key] = url
      }
      catch (err) {
        console.error(`Error for ${key}:`, err)
        urls.value[key] = '#'
      }
    }
  }
  catch (error) {
    console.error('Error generating URLs:', error)
    error.value = 'Une erreur est survenue lors de la génération des liens'
  }
  finally {
    loading.value = false
  }
})
</script>

<style scoped>
.ga-1 {
  gap: 4px;
}
</style>
