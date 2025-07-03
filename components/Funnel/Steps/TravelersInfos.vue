<template>
  <v-container>
    <v-form
      ref="formInfos"
    >
      <v-row>
        <v-col cols="12">
          <h2>{{ page.travelers_infos.title }}</h2>
          <!-- <h2>{{ $t('stepperDevisGroup.travellersDetails') }}</h2> -->
        </v-col>
        <v-col cols="12">
          <v-alert
            border="start"
            colored-border
            color="primary"
            elevation="2"
            class="text-subtitle-2"
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
            @change="travelerInfosChanged"
          />

          <!-- Check si c'est suffisant ou si on souhaite afficher un message particulier au nb d'enfants -->
          <p
            v-show="!ageValidation.isValid"
            class="text-error text-right mt-2"
          >
            {{ ageValidationMessage }}
          </p>
          <!-- New: Error message for missing fields -->
          <p
            v-show="!allFieldsFilled"
            class="text-error text-right"
          >
            {{ page.travelers_infos.all_fields_required }}
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col
          v-if="nbTravelers > 1"
          cols="12"
          class="py-0"
        >
          <v-switch
            v-model="model.isCouple"
            style="margin-bottom : 5px"
            :label="page.travelers_infos.preference_couple"
          />
        </v-col>
      </v-row>
    </v-form>
    <v-row>
      <v-col
        class="d-flex ga-3"
      >
        <v-btn
          class="bg-grey-light font-weight-regular"
          @click="emit('previous')"
        >
          Précédent
        </v-btn>
        <v-btn
          :disabled="!formValidation || !isBookingLoaded"
          color="secondary"
          class="font-weight-bold"
          @click="submitStepData"
        >
          Suivant
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'

const { voyage, currentStep, ownStep, page } = defineProps(['voyage', 'currentStep', 'ownStep', 'page', 'initialDealValues'])
const { updateDeal } = useStepperDeal(ownStep)
const route = useRoute()
const model = defineModel()

const { addSingleParam } = useParams()

// New: Local validation state
const emit = defineEmits(['next', 'previous'])

const isCouple = ref(false)
const nbTravelers = ref(1)
const dealNbChildren = ref(0)
const dealNbAdults = ref(0)
const travelers = ref([])

// Add computed properties for age validation
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

  return {
    children,
    adults,
  }
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
// New: Check that all traveler fields are filled
const allFieldsFilled = computed(() => {
  return travelers.value.every(
    t => t.firstname && t.lastname && t.birthdate,
  )
})

// New: Combined validation logic
const formValidation = computed(() => {
  return ageValidation.value.isValid && allFieldsFilled.value
})

// New: Watch validation and emit changes

// Data Initialization
const initializeTravelersData = () => {
  if (model.value) {
    nbTravelers.value = +model.value.nbChildren + +model.value.nbAdults || 1

    dealNbChildren.value = +model.value.nbChildren || 0
    dealNbAdults.value = +model.value.nbAdults || 0

    isCouple.value = +model.value.isCouple

    travelers.value = Array.from({ length: nbTravelers.value }, (_, index) => {
      const storedTraveler = model.value?.[`traveler${index + 1}`]

      if (storedTraveler) {
        const [firstname, lastname, birthdate] = storedTraveler.split('_')
        return {
          id: index + 1,
          firstname,
          lastname,
          birthdate,
        }
      }

      return {
        id: index + 1,
        firstname: null,
        lastname: null,
        birthdate: null,
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
}, {
  immediate: true,
})

const travelerInfosChanged = (updatedTraveler) => {
  const index = travelers.value.findIndex(t => t.id === updatedTraveler.id)
  if (index !== -1) {
    travelers.value.splice(index, 1, updatedTraveler)
    model.value[`traveler${updatedTraveler.id}`] = `${updatedTraveler.firstname}_${updatedTraveler.lastname}_${updatedTraveler.birthdate}`
  }
}

const submitStepData = () => {
  // Validate form
  if (!model.value) return false

  // Validate ages
  if (!ageValidation.value.isValid) {
    console.error('Age validation failed:', {
      expected: {
        children: +model.value.nbChildren,
        adults: +model.value.nbAdults,
      },
      actual: {
        children: ageValidation.value.childrenCount,
        // teenagers: ageValidation.value.teenagersCount,
        adults: ageValidation.value.adultsCount,
      },
    })
    return false
  }

  // Validate all fields are filled
  if (!allFieldsFilled.value) {
    console.error('Not all traveler fields are filled')
    return false
  }

  try {
    const dealData = {
      isCouple: model.value.isCouple ? 'Oui' : 'Non',
      ...travelers.value.reduce((acc, traveler, index) => {
        acc[`traveler${index + 1}`] = `${traveler.firstname}_${traveler.lastname}_${traveler.birthdate}`
        return acc
      }, {}),
    }

    updateDeal(dealData)
    emit('next')
  }
  catch (error) {
    console.error('Error updating travelers info', error)
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
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
