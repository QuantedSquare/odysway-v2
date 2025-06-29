<template>
  <v-skeleton-loader
    v-if="!dealId"
    type="card"
  />
  <v-container
    v-else
  >
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
          <TransitionGroup name="list">
            <FunnelStepsTravelerInfosItem
              v-for="(traveler, i) in travelers"
              v-bind="traveler"
              :key="'nb_travelers_' + i"
              :bg-color="colorMap[i]"
              @change="travelerInfosChanged"
            />
          </TransitionGroup>
          <!-- Check si c'est suffisant ou si on souhaite afficher un message particulier au nb d'enfants -->
          <p
            v-show="!ageValidation.isValid"
            class="text-error text-right"
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
            v-model="isCouple"
            style="margin-bottom : 5px"
            :label="page.travelers_infos.preference_couple"
          />
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
import dayjs from 'dayjs'

const props = defineProps(['voyage', 'currentStep', 'ownStep', 'page'])
const { deal, dealId, updateDeal } = useStepperDeal(props.ownStep)
const { addSingleParam } = useParams()

// New: Local validation state
const isValid = ref(false)
const emit = defineEmits(['validity-changed'])

const isCouple = ref(false)
const nbTravelers = ref(1)
const dealNbChildren = ref(0)
// const dealNbTeenagers = ref(0)
const dealNbAdults = ref(0)
const travelers = ref([])
const isLoading = ref(true)

// Add computed properties for age validation
const computedAges = computed(() => {
  const departureDate = dayjs(deal.value?.departureDate)
  const children = []
  // const teenagers = []
  const adults = []

  travelers.value.forEach((traveler) => {
    if (!traveler.birthdate) return

    const birthdate = dayjs(traveler.birthdate, 'DD/MM/YYYY')
    const age = departureDate.diff(birthdate, 'year')
    console.log('age', age)
    console.log('maxTeenAge', deal.value?.maxTeenAge)
    console.log('maxChildrenAge', deal.value?.maxChildrenAge)

    if (age <= +deal.value?.maxChildrenAge) {
      children.push(traveler)
    }
    else {
      adults.push(traveler)
    }
    console.log('children', children)
    // console.log('teenagers', teenagers)
    console.log('adults', adults)
  })

  return {
    children,
    // teenagers,
    adults,
  }
})

const ageValidationMessage = computed(() => {
  const maxAge = Number(deal.value?.maxChildrenAge) || 12
  return props.page.travelers_infos.age_validation.replace('{{maxAge}}', maxAge)
})

const ageValidation = computed(() => {
  const { children, adults } = computedAges.value
  return {
    isValid: children.length === dealNbChildren.value
      // && teenagers.length === dealNbTeenagers.value
      && adults.length === dealNbAdults.value
      && adults.length > 0,
    childrenCount: children.length,
    // teenagersCount: teenagers.length,
    adultsCount: adults.length,
  }
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
watch(formValidation, (isFormValid) => {
  isValid.value = isFormValid
  emit('validity-changed', props.ownStep, isFormValid)
}, { immediate: true })

// Data Initialization
const initializeTravelersData = () => {
  if (deal.value) {
    console.log('INITIALIZE TRAVELERS DATA', deal.value)
    nbTravelers.value = deal.value?.nbTravelers || 1

    dealNbChildren.value = +deal.value?.nbUnderAge || 0
    // dealNbTeenagers.value = +deal.value?.nbTeen || 0
    dealNbAdults.value = +deal.value?.nbAdults || 0
    // Max children age : +deal.value?.maxChildrenAge
    // Max teenagers age : +deal.value?.maxTeenAge

    const numberOfTravelers = deal.value?.nbTravelers || 1
    isCouple.value = deal.value?.isCouple === 'Oui'

    travelers.value = Array.from({ length: numberOfTravelers }, (_, index) => {
      const storedTraveler = deal.value?.[`traveler${index + 1}`]

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

    isLoading.value = false
  }
  else {
    isLoading.value = false
  }
}

watch([deal, dealId, () => props.currentStep], () => {
  if (props.currentStep === props.ownStep && dealId.value) {
    if (deal.value) {
      initializeTravelersData()
    }
    addSingleParam('step', props.ownStep)
  }
}, {
  immediate: true,
})

const travelerInfosChanged = (updatedTraveler) => {
  const index = travelers.value.findIndex(t => t.id === updatedTraveler.id)
  if (index !== -1) {
    travelers.value.splice(index, 1, updatedTraveler)
  }
}

const submitStepData = async () => {
  // Validate form
  // if (!validateForm()) return false
  if (!dealId.value) return false

  // Validate ages
  if (!ageValidation.value.isValid) {
    console.error('Age validation failed:', {
      expected: {
        children: dealNbChildren.value,
        // teenagers: dealNbTeenagers.value,
        adults: dealNbAdults.value,
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
      isCouple: isCouple.value ? 'Oui' : 'Non',
      dealId: dealId.value,
      ...travelers.value.reduce((acc, traveler, index) => {
        acc[`traveler${index + 1}`] = `${traveler.firstname}_${traveler.lastname}_${traveler.birthdate}`
        return acc
      }, {}),
    }

    await updateDeal(dealData)
    return true
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

// We need to check if the travelers info are valid and the ages respect the deal number of children/teenagers/adults
defineExpose({
  submitStepData,
})
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
