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
          <v-alert
            border="start"
            colored-border
            color="grey-light"
            elevation="0"
            class="text-caption text-blue"
          >
            {{ page.travelers_infos.alert }}
          </v-alert>
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
            @change="travelerInfosChanged"
          />
        </v-col>
      </v-row>
      <v-divider />
      <v-row>
        <v-col
          v-if="nbTravelers > 1"
          cols="12"
          class="py-2"
        >
          <v-switch
            v-model="model.isCouple"
            style="margin-bottom: 5px"
            :label="page.travelers_infos.preference_couple"
          />
        </v-col>
      </v-row>

      <!-- Options section -->
      <v-row v-if="voyage.gotIndivRoomAvailable && voyage.indivRoomPrice > 0">
        <v-col cols="12">
          <h2>{{ page.options.indiv_room_title }}</h2>
        </v-col>
        <v-col
          cols="8"
          :class="model.indivRoom ? 'text-primary' : 'text-grey'"
        >
          <v-switch
            v-model="model.indivRoom"
            :label="page.options.indiv_room_label"
            :disabled="forcedIndivRoom"
          />
          <FunnelStepsDialogLearnMore
            :btn-text="page.room_indiv_accroche"
            :dialog-text="page.room_indiv_text"
            :page="page"
          />
        </v-col>
        <v-col
          class="d-flex justify-end align-start text-body-1"
          :class="model.indivRoom ? 'text-primary' : 'text-grey'"
        >
          + {{ formatNumber(voyage.indivRoomPrice, 'currency', '€') }} / pers.
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <h2 class="h2-option">
            {{ page.options.food_details_title }}
          </h2>
        </v-col>
        <v-col cols="12">
          <v-textarea
            v-model="model.specialRequest"
            variant="outlined"
            :label="page.options.special_request_label"
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
            Continuer
          </v-btn>
          <v-btn
            class="bg-grey-light font-weight-regular text-primary"
            block
            height="50"
            @click="emit('previous')"
          >
            Précédent
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
