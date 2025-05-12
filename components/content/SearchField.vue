<template>
  <v-container class="search-field-container">
    <div class="rounded-lg bg-white pa-4 search-field-shadow">
      <ClientOnly>
        <v-row align="center">
          <v-col
            cols="12"
            md="3"
          >
            <v-autocomplete
              v-model="destinationChoice"
              label="Destinations"
              :items="destinationsList"
              clearable
              :prepend-inner-icon="mdiMapMarkerOutline"
              hide-details
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-select
              v-model="travelTypeChoice"
              :items="travelTypes"
              hide-details
              label="Type de voyage"
              clearable
              :prepend-inner-icon="mdiTargetAccount"
            />
          </v-col>
          <v-col
            :cols="12"
            md="3"
          >
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              location="end"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :value="formattedDate"
                  readonly
                  class="font-weight-bold text-primary"
                  hide-details
                  :prepend-inner-icon="mdiCalendarBlankOutline"
                />
              </template>

              <v-card
                min-width="300"
                elevation="6"
              >
                <v-locale-provider locale="fr">
                  <v-date-picker
                    v-model="date"
                    multiple="range"
                    width="400"
                    format="dd/mm/YYYY"
                    :min="new Date()"
                    show-adjacent-months
                  />
                </v-locale-provider>
              </v-card>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            md="3"
            class=" h-100"
          >
            <v-btn
              height="56"
              block
              color="secondary"
              class="text-none text-body-1"
              @click="search"
            >
              Découvrir les voyages
            </v-btn>
          </v-col>
        </v-row>
      </ClientOnly>
    </div>
  </v-container>
</template>

<script setup>
import { mdiMapMarkerOutline, mdiTargetAccount, mdiCalendarBlankOutline } from '@mdi/js'
import dayjs from 'dayjs'

const router = useRouter()
const dateMenu = ref(false)

// Replace individual refs with useState
const date = useState('searchDate', () => [])

const travelTypeChoice = useState('searchTravelType', () => null)
const destinationChoice = useState('searchDestination', () => null)

const { data: destinations } = await useAsyncData('destinations', () => {
  return queryCollection('destinations').where('id', '=', 'destinations/destinations/destinations.json').first()
})

const destinationsList = computed(() => {
  return destinations.value.meta.body.map(d => d.nom.charAt(0).toUpperCase() + d.nom.slice(1))
})

const travelTypes = ref([
  'Voyage individuel', 'Voyage en groupe',
])

const formattedDate = computed(() => {
  return date.value ? dayjs(date.value[0]).format('DD/MM') + ' - ' + dayjs(date.value[date.value.length - 1]).format('DD/MM') : ''
})

const search = () => {
  if (destinationsChoices.value?.length > 0) {
    console.log('destinationsChoices.value', destinationsChoices.value)
    router.push({
      path: '/search',
      query: {
        destination: slugify(destinationsChoices.value, { lower: true }),
        travelTypes: travelTypeChoices.value,
        date: date.value ? `${dayjs(date.value[0]).format('YYYY-MM-DD')}-${dayjs(date.value[date.value.length - 1]).format('YYYY-MM-DD')}` : '',
      },
    })
  }
}
const isSearchPage = computed(() => {
  return route.name === 'search'
})
</script>

<style scoped>
:deep(.v-icon__svg) {
  color: rgb(var(--v-theme-primary)) !important;
}
:deep(.v-field__input) {
  color: rgb(var(--v-theme-primary)) !important;
}
.search-field-container {
  max-width: 1070px;
}
.search-field-shadow {
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
</style>
