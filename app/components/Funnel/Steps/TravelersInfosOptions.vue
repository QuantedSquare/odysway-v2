<template>
  <v-container>
    <v-form ref="formInfos">
      <v-row>
        <v-col
          cols="12"
          class="d-flex ga-2 pb-0"
        >
          <v-divider
            variant="solid"
            opacity="1"
            thickness="3"
            class="rounded-lg"
            color="secondary"
            vertical
          />
          <h2>{{ page.travelers_infos.title }}</h2>
        </v-col>
        <v-col cols="12">
          {{ page.travelers_infos.alert }}
        </v-col>
        <v-col cols="12">
          <v-skeleton-loader
            v-if="travelers.length === 0"
            type="card"
          />

          <FunnelStepsTravelerInfosItem
            v-for="(traveler, i) in travelers"
            v-bind="traveler"
            :key="'nb_travelers_' + i"
            :bg-color="colorMap[i]"
            :iso-contact="traveler.isoContact"
            :flat="i === 0"
            :is-single="travelers.length === 1"
            :page="page"
            @change="travelerInfosChanged"
          />
        </v-col>
      </v-row>
      <v-divider
        v-if="voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0"
        class="my-3"
      />
      <v-row v-if=" voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0">
        <v-col
          v-if="voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0"
          cols="12"
          class="d-flex ga-2 pb-0 mt-3"
        >
          <v-divider
            variant="solid"
            opacity="1"
            thickness="3"
            class="rounded-lg"
            color="secondary"
            vertical
          />
          <h2>{{ page?.travelers_infos_form?.options_title || 'Options' }}</h2>
        </v-col>

        <v-col>
          <div class="font-weight-bold text-subtitle-2">
            {{ page.options.indiv_room_title || 'Chambre individuelle' }}
          </div>
          <div class="font-weight-bold text-caption">
            + {{ formatNumber(voyage.indivRoomPrice, 'currency', '€') }} / pers.
          </div>
          <div class="text-caption text-grey">
            {{ page.options.indiv_room_label }}
          </div>
        </v-col>
        <v-col
          cols="auto"
          class="d-flex align-center"
        >
          <v-switch
            v-model="model.indivRoom"
            hide-details
            :disabled="forcedIndivRoom"
            color="success"
            density="compact"
          />
        </v-col>

      <!-- Indiv room option -->
      </v-row>

      <v-divider class="my-6" />

      <!-- Preferences & besoins -->
      <v-row>
        <v-col
          cols="12"
          class="d-flex ga-2 pb-2"
        >
          <h2>
            {{ page?.travelers_infos_form?.preferences_title || 'Préférences & besoins' }}
          </h2>
          <span class="text-caption text-grey align-self-center">{{ page?.travelers_infos_form?.optional_label || '· optionnel' }}</span>
        </v-col>
        <v-col cols="12">
          <p class="font-weight-bold text-caption mb-2">
            {{ page.options.special_request_label }}
          </p>
          <v-textarea
            v-model="model.specialRequest"
            :placeholder="page?.travelers_infos_form?.special_request_placeholder || 'Ex : végétarien, allergie aux noix, genoux fragiles...'"
            hide-details
            flat
            variant="solo"
            rounded="md"
            bg-color="surface-panel"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          class="d-flex flex-column ga-4"
        >
          <v-btn
            :disabled="!formValidation || !isBookingLoaded"
            color="secondary"
            class="font-weight-bold"
            block
            height="50"
            @click="submitStepData"
          >
            {{ page?.travelers_infos_form?.continue_button || 'Continuer' }}
            <v-icon>
              {{ mdiArrowRight }}
            </v-icon>
          </v-btn>
          <v-btn
            class="bg-grey-light font-weight- text-primary"
            block
            height="50"
            @click="emit('previous')"
          >
            <v-icon>
              {{ mdiArrowLeft }}
            </v-icon>
            {{ page?.travelers_infos_form?.previous_button || 'Précédent' }}
          </v-btn>
        </v-col>
        <v-col>
          <div class="text-error text-right mt-6 mt-md-6">
            <p v-show="!ageValidation.isValid">
              - {{ ageValidationMessage }}
            </p>
            <p v-show="!allFieldsFilled">
              - {{ page.travelers_infos.all_fields_required }}
            </p>
          </div>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'
import { mdiRadioboxBlank, mdiRadioboxMarked, mdiArrowLeft, mdiArrowRight } from '@mdi/js'

const { trackReservationStep } = useGtmTracking()

const { voyage, currentStep, ownStep, page } = defineProps(['voyage', 'currentStep', 'ownStep', 'page'])
const { updateDeal } = useStepperDeal()
const route = useRoute()
const model = defineModel()

const { addSingleParam } = useParams()

const emit = defineEmits(['next', 'previous'])

const nbTravelers = ref(1)
const dealNbChildren = ref(0)
const dealNbAdults = ref(0)
const travelers = ref([])

// Age validation
const computedAges = computed(() => {
  const departureDate = dayjs(voyage.departureDate)
  const children = []
  const adults = []

  travelers.value.forEach((traveler) => {
    if (!traveler.birthdate) return
    const birthdate = dayjs(traveler.birthdate, 'DD/MM/YYYY')
    const age = departureDate.diff(birthdate, 'year')
    if (age <= +voyage.maxChildrenAge) {
      children.push(traveler)
    }
    else {
      adults.push(traveler)
    }
  })

  return { children, adults }
})

const ageValidationMessage = computed(() => {
  const maxAge = Number(voyage.maxChildrenAge) || 12
  return page.travelers_infos.age_validation.replace('{{maxAge}}', maxAge)
})

const ageValidation = computed(() => {
  const { children, adults } = computedAges.value
  return {
    isValid: children.length === +model.value.nbChildren
      && adults.length === +model.value.nbAdults
      && adults.length > 0,
    childrenCount: children.length,
    adultsCount: adults.length,
  }
})

const isBookingLoaded = computed(() => {
  return route.query.booked_id !== undefined && route.query.booked_id !== null && route.query.booked_id !== '' && route.query.date_id === undefined
})

const allFieldsFilled = computed(() => {
  return travelers.value.every(
    t => t.firstname && t.lastname && t.birthdate && t.isoContact,
  )
})

const formValidation = computed(() => {
  return ageValidation.value.isValid && allFieldsFilled.value
})

// Options: forced indiv room
const forcedIndivRoom = computed(() => {
  return voyage?.forcedIndivRoom && voyage.indivRoomPrice > 0 && (model.value.nbAdults + model.value.nbChildren === 1) && model.value.nbChildren === 0
})

watch(forcedIndivRoom, () => {
  model.value.indivRoom = forcedIndivRoom.value
}, { immediate: true })

// Travelers initialization
const initializeTravelersData = () => {
  if (model.value) {
    nbTravelers.value = +model.value.nbChildren + +model.value.nbAdults || 1
    dealNbChildren.value = +model.value.nbChildren || 0
    dealNbAdults.value = +model.value.nbAdults || 0

    const mainContactIso = model.value.isoContact || ''

    travelers.value = Array.from({ length: nbTravelers.value }, (_, index) => {
      const storedTraveler = model.value?.[`traveler${index + 1}`]

      if (storedTraveler) {
        const parts = storedTraveler.split('_')
        const [firstname, lastname, birthdate, isoContact = ''] = parts
        return {
          id: index + 1,
          firstname: firstname || null,
          lastname: lastname || null,
          birthdate: birthdate || null,
          isoContact: isoContact && isoContact.trim() !== '' ? isoContact : mainContactIso,
        }
      }

      return {
        id: index + 1,
        firstname: null,
        lastname: null,
        birthdate: null,
        isoContact: mainContactIso,
      }
    })
  }
}

watch([model, () => currentStep], () => {
  if (currentStep === ownStep) {
    if (model.value) {
      initializeTravelersData()
    }
    addSingleParam('step', ownStep)
  }
}, { immediate: true })

const travelerInfosChanged = (updatedTraveler) => {
  const index = travelers.value.findIndex(t => t.id === updatedTraveler.id)
  if (index !== -1) {
    travelers.value[index] = { ...updatedTraveler }
    model.value[`traveler${updatedTraveler.id}`] = `${updatedTraveler.firstname}_${updatedTraveler.lastname}_${updatedTraveler.birthdate}_${updatedTraveler.isoContact || ''}`
  }
}

const submitStepData = () => {
  if (!model.value) return false
  if (!ageValidation.value.isValid) return false
  if (!allFieldsFilled.value) return false

  try {
    const dealData = {
      isCouple: model.value.isCouple ? 'Oui' : 'Non',
      ...travelers.value.reduce((acc, traveler, index) => {
        acc[`traveler${index + 1}`] = `${traveler.firstname}_${traveler.lastname}_${traveler.birthdate}_${traveler.isoContact}`
        return acc
      }, {}),
      specialRequest: model.value.specialRequest,
      indivRoom: model.value.indivRoom || forcedIndivRoom.value ? ['Oui'] : ['Non'],
      currentStep: 'A choisi ses options',
    }

    updateDeal(dealData)

    const { getCountryFromPhone } = useGtmTracking()
    const additionalData = {
      optin_newsletter: model.value.optinNewsletter,
      user_data: {
        user_id: model.value.email,
        user_mail: model.value.email,
        user_phone: model.value.phone,
        user_country: getCountryFromPhone(model.value.phone),
      },
    }
    trackReservationStep(2, voyage, model.value, additionalData)

    emit('next')
  }
  catch (error) {
    console.error('Error updating travelers & options', error)
    return false
  }
}

const colorMap = {
  0: 'green',
  1: 'blue',
  2: 'red',
  3: 'yellow',
  4: 'purple',
  5: 'orange',
  6: 'cyan',
  7: 'teal',
  8: 'pink',
}
</script>

<style scoped>
.bed-type-toggle {
  gap: 12px;
  background: transparent !important;
}
.bed-type-btn {
  flex: 1;
  border-radius: 8px !important;
  border: 1.5px solid rgb(var(--v-theme-primary)) !important;
  text-transform: none;
  letter-spacing: 0;
}
.bed-type-btn.v-btn--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgb(var(--v-theme-surface)) !important;
  color: rgb(var(--v-theme-primary)) !important;
}
.alert:deep(.v-alert__border){
  border-inline-start-width:5px!important;
  opacity: 1;
}
.alert:deep(.v-alert__content){
  margin-left: -10px!important;
}
</style>
