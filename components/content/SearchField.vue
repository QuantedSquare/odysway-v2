<template>
  <div class="rounded-lg bg-white pa-4">
    <ClientOnly>
      <v-row align="center">
        <v-col
          cols="6"
          :md="isSearchPage ? 2 : 3"
        >
          <v-autocomplete
            v-model="destinationsChoices"
            label="Destinations"
            :items="destinations"
            variant="outlined"
            clearable
            :prepend-inner-icon="mdiMapMarkerOutline"
            hide-details
          />
        </v-col>
        <v-col
          cols="6"
          :md="isSearchPage ? 2 : 3"
        >
          <v-select
            v-model="travelTypeChoices"
            :items="travelTypes"
            hide-details
            label="Type de voyage"
            multiple
            :prepend-inner-icon="mdiTargetAccount"
          />
        </v-col>
        <v-col
          :cols="2"
          :md="isSearchPage ? 2 : 3"
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
                />
              </v-locale-provider>
            </v-card>
          </v-menu>
        </v-col>
        <!-- Visible only on search page -->
        <v-col
          v-if="isSearchPage"
          cols="6"
          :md="isSearchPage ? 2 : 0"
        >
          <v-select
            v-model="travelTypeChoices"
            :items="travelTypes"
            hide-details
            label="Plus de filtres"
            clearable
            chips
            closable-chips
            multiple
            :prepend-inner-icon="mdiTune"
          />
        </v-col>
        <v-col
          cols="6"
          :md="isSearchPage ? 2 : 3"
          class=" h-100"
        >
          <v-btn
            height="56"
            block
            color="#DB6644"
            class="text-none text-body-1"
            @click="search"
          >
            Découvrir les voyages
          </v-btn>
        </v-col>
      </v-row>
    </ClientOnly>
  </div>
</template>

<script setup>
import { mdiMapMarkerOutline, mdiTargetAccount, mdiCalendarBlankOutline, mdiTune } from '@mdi/js'
import dayjs from 'dayjs'
import slugify from 'slugify'

const router = useRouter()
const route = useRoute()
const dateMenu = ref(false)

// Replace individual refs with useState
const date = useState('searchDate', () => [])
const travelTypeChoices = useState('searchTravelTypes', () => [])
const destinationsChoices = useState('searchDestination', () => 'FR')

const destinations = ref([
  { value: 'FR', title: 'France' },
  { value: 'IT', title: 'Italie' },
  { value: 'ES', title: 'Espagne' },
  { value: 'PT', title: 'Portugal' },
  { value: 'TR', title: 'Turquie' },
  { value: 'GR', title: 'Grèce' },
])
const travelTypes = [
  'All', 'Voyage individuel', 'Voyage en famille', 'Voyage en couple', 'Voyage en groupe',
]

const formattedDate = computed(() => {
  return date.value ? dayjs(date.value[0]).format('ll') + ' - ' + dayjs(date.value[date.value.length - 1]).format('ll') : ''
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
console.log(isSearchPage.value)
</script>

<!-- <style lang="css" scoped>
.inner-textfield:deep(.v-field__overlay) {
  background-color: rgba(255, 255, 255, 0.214)!important;
  backdrop-filter: blur(8px);
  box-shadow: 2px 2px 5px  rgba(255, 255, 255, 0.3);
}
.inner-textfield:deep(.v-field__field){
  text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.554);
}
</style> -->
