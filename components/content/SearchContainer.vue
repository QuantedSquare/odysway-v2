<template>
  <v-container class="search-field-container py-0">
    <div class="rounded-lg bg-white pa-4 pb-0 search-field-shadow">
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
              hide-details
              :menu-props="{ scrollStrategy: 'close', contentClass: 'rounded-md' }"
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/two-pin-marker.svg', { format: 'webp', quality: 70, width: 640 })"
                  alt="Pin marker"
                  width="24"
                  height="24"
                />
              </template>
            </v-autocomplete>
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
            >
              <template #prepend-inner>
                <v-img
                  :src="img('/icons/business-team.svg', { format: 'webp', quality: 70, width: 640 })"
                  alt="Team icon"
                  width="24"
                  height="24"
                />
              </template>
            </v-select>
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
                >
                  <template #prepend-inner>
                    <v-img
                      :src="img('/icons/calendar.svg', { format: 'webp', quality: 70, width: 640 })"
                      alt="Calendar icon"
                      width="24"
                      height="24"
                    />
                  </template>
                </v-text-field>
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
                    :min="new Date()"
                    show-adjacent-months
                    @update:model-value="() => { date.length > 1 ? dateMenu = false : '' } "
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
              :loading="status === 'pending'"
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
import dayjs from 'dayjs'
import { useImage } from '#imports'

const img = useImage()
const router = useRouter()
const route = useRoute()
const dateMenu = ref(false)
const { gtag } = useGtag()
// Replace individual refs with useState
const date = useState('searchDate', () => [])
const travelTypeChoice = useState('searchTravelType', () => null)
const destinationChoice = useState('searchDestination', () => route.query.destination || null)

const { data: destinations, status } = useAsyncData('destinations', () => {
  return queryCollection('destinations').select('titre', 'slug', 'metaDescription', 'published', 'regions', 'image', 'stem').where('published', '=', true).all()
})
const destinationsList = computed(() => {
  return destinations.value?.map((d) => {
    return {
      title: d.titre,
      value: d.stem.split('/')[1],
      image: d.image,
      group: d.regions.map(r => r.nom).join(', '),
    }
  })
})

const travelTypes = [
  'Voyage individuel', 'Voyage en groupe',
]

const formattedDate = computed(() => {
  return date.value ? dayjs(date.value[0]).format('DD/MM') + ' - ' + dayjs(date.value[date.value.length - 1]).format('DD/MM') : ''
})

function search() {
  const query = {}
  if (destinationChoice.value) {
    query.destination = destinationChoice.value
  }
  if (travelTypeChoice.value) {
    query.travelType = travelTypeChoice.value
  }
  if (date.value.length > 0) {
    query.from = `${dayjs(date.value[0]).format('YYYY-MM-DD')}`
    query.to = `${dayjs(date.value[date.value.length - 1]).format('YYYY-MM-DD')}`
  }

  gtag('event', 'search', { eventAction: 'Click', destination: `${destinationChoice.value}`, travelType: `${travelTypeChoice.value}`, from: `${date.value[0]}`, to: `${date.value[1]}` })

  router.push({
    path: '/search',
    query,
  })
}
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
  min-height: 88px!important;
  box-shadow: 5px 5px 100px 0px rgba(43, 76, 82, 0.5);
}
</style>
