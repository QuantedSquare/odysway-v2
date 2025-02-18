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
      v-model="model"
    >
      <v-row>
        <v-col cols="12">
          <h2>Informations voyageurs</h2>
          <!-- <h2>{{ $t('stepperDevisGroup.travellersDetails') }}</h2> -->
        </v-col>
        <v-col cols="12">
          <v-alert
            border="start"
            colored-border
            color="primary"
            elevation="2"
          >
            Les informations ci-dessous doivent être identiques à celles qui sont écrites sur les documents d’identité utilisés pour ce voyage.

            <!-- {{ page.fields.rappel_informations_voyageurs }} -->
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
        </v-col>
        <!-- <v-row v-show="ageConfirmationFailed && validTravelers && nbTeenUnder18 !== teenUnder18">
          <v-col cols="12">
            <p class="accent--text">
              Les voyageurs âgés de {{ Number(voyage.age_ado) }} ans au moment du départ sont considérés comme des
              adultes.
            </p>
          </v-col>
        </v-row>
        <v-row v-show="ageConfirmationFailed && validTravelers && nbChildrenUnder12 !== childrenUnder12">
          <v-col cols="12">
            <p class="accent--text">
              Les voyageurs âgés de {{ Number(voyage.age_enfant) }} ans au moment du départ sont considérés comme des
              adolescents.
            </p>
          </v-col>
        </v-row> -->
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
            :label="page.fields.preference_couple"
          />
          <!-- page.fields.preference_couple" -->
          <!-- <div v-html="page.fields.preference_couple_details" /> -->
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const { deal, dealId, updateDeal } = useDeal(() => props.currentStep, () => props.ownStep)

const isCouple = ref(false)
const nbTravelers = ref(1)
const travelers = ref([])
const isLoading = ref(true)

// Form model
const model = defineModel()

// watch([() => props.currentStep, ], (value) => {
//   if (value === props.ownStep && dealId.value) {
//     addAnotherParameter('currentStep', props.ownStep)
//   }
// }, { immediate: true })

// Data Initialization
const initializeTravelersData = () => {
  if (deal.value) {
    nbTravelers.value = deal.value?.nbTravelers || 1
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

watch([deal, () => props.currentStep], () => {
  if (deal.value) {
    initializeTravelersData()
    if (dealId.value && props.currentStep === props.ownStep) {
      addAnotherParameter('currentStep', props.ownStep)
    }
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
