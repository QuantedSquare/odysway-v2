<template>
  <div class="d-flex flex-column  rounded-lg bg-white pa-4">
    <v-row align="center">
      <v-col
        cols="6"
        md="3"
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
        md="3"
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
        cols="6"
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
      <v-col
        cols="6"
        md="3"
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
  </div>
</template>

<script setup>
import { mdiMapMarkerOutline, mdiTargetAccount, mdiCalendarBlankOutline, mdiTune } from '@mdi/js'
import dayjs from 'dayjs'
import slugify from 'slugify'

const router = useRouter()
const dateMenu = ref(false)
const date = ref([])
const travelTypeChoices = ref([])
const destinationsChoices = ref('fr')
const destinations = ref(['France', 'Italie', 'Espagne', 'Portugal', 'Turquie', 'Grèce'])
const travelTypes = [
  'All', 'Voyage individuel', 'Voyage en famille', 'Voyage en couple', 'Voyage en groupe',
]

const formattedDate = computed(() => {
  return date.value ? dayjs(date.value[0]).format('ll') + ' - ' + dayjs(date.value[date.value.length - 1]).format('ll') : ''
})

const search = () => {
  if (destinationsChoices.value.length > 0) {
    router.push({
      path: '/search',
      query: {
        destination: slugify(destinationsChoices.value, { lower: true }),
        travelTypes: travelTypeChoices.value,
        // #TODO change formating of dates
        date: date.value ? `${dayjs(date.value[0]).format('YYYY-MM-DD')}-${dayjs(date.value[date.value.length - 1]).format('YYYY-MM-DD')}` : '',
      },
    })
  }
}
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
