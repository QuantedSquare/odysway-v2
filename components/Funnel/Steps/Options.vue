<template>
  <v-skeleton-loader
    v-if="!dealId"
    type="card"
  />
  <v-container v-else>
    <!-- <v-row v-if="voyage.indiv_room && !forcedIndivRoom"> -->
    <v-row>
      <v-col cols="12">
        <h2>{{ page.fields.room_indiv_title }}</h2>
      </v-col>
      <!-- :label="$t('stepperDevisGroup.roomIndivLabel')" -->
      <v-col cols="12">
        <v-switch
          v-model="indivRoom"
          label="Je souhaite bénéficier d'une chambre individuelle"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.fields.room_indiv_accroche"
          :dialog-text="page.fields.room_indiv_text"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h2 class="h2-option">
          {{ page.fields.food_details_title }}
        </h2>
      </v-col>
      <v-col
        cols="12"
        md="4"
        class="d-flex justify-start align-center"
      >
        <div>
          <v-switch
            v-model="vegeOption"
            sub-label="Végétarien, Végan, Allergies..."
          >
            <template #label>
              <div class="d-flex flex-column align-start">
                <!-- <span>{{ $t('stepperDevisGroup.foodOptions.vege') }}</span> -->
                <span>Régimes alimentaires spécifiques</span>
                <span class="text-caption">Végétarien, Végan, Allergies...</span>
              </div>
            </template>
          </v-switch>
        </div>
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <!-- :label="$t('stepperDevisGroup.foodOptions.other')" -->
        <v-switch
          v-model="otherFoodOption"
          label="Autres demandes particulières"
        />
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <!-- :label="$t('stepperDevisGroup.foodOptions.spec')" -->
        <Transition name="slide-fade">
          <v-textarea
            v-if="otherFoodOption"
            v-model="specialRequest"
            variant="outlined"
            label="Précisez"
          />
        </Transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep'])
const { deal, dealId, updateDeal } = useDeal(() => props.currentStep, () => props.ownStep)

const specialRequest = ref('')
const indivRoom = ref(false)
const indivRoomPrice = ref(0)
const pricePerTraveler = ref(0)
const totalTravelPrice = ref(0)

const vegeOption = ref(false)
const otherFoodOption = ref(false)

const model = defineModel()

watch([deal, () => props.currentStep], () => {
  model.value = true
  if (dealId.value && deal.value) {
    if (deal.value && deal.value.nbTravelers) {
      indivRoomPrice.value = +deal.value.indivRoomPrice
      pricePerTraveler.value = +deal.value.pricePerTraveler
      totalTravelPrice.value = +deal.value.totalTravelPrice

      indivRoom.value = deal.value.indivRoom?.includes('Oui')
      vegeOption.value = deal.value.specialRequest?.includes('Régimes alimentaires spécifiques')
      otherFoodOption.value = deal.value.specialRequest?.includes('Autres demandes particulières')
      specialRequest.value = deal.value.specialRequest?.match(/Autres demandes particulières :(.*)/)?.[1].trim()
    }
  }
  if (props.currentStep === props.ownStep) {
    addAnotherParameter('currentStep', props.ownStep)
  }
}, { immediate: true })

const foodPreferences = computed(() => {
  const foodPreferences = [
    vegeOption.value ? 'Régimes alimentaires spécifiques' : '',
    otherFoodOption.value ? 'Autres demandes particulières' : '',
  ]
  return `${foodPreferences.join(', ')} : ${specialRequest.value}`
})

// #TODO Calculate pricePerTraveler from deal
// const pricePerTraveler = computed(() => {
//   return stepperPricing.pricePerTraveler(datesGroup.prix_voyage,
//     insurancePricePerTraveler,
//     voyage.indiv_room_price * options.indivRoom,
//     promo.amount / 100 * promo.isValid,
//     earlybird.price * earlybird.isAvailable,
//     lastMinute.price * lastMinute.isAvailable)
// })
// Total Acompte & voyage

// const totalPrice = computed(() => {
//   return pricePerTraveler.value * deal.value.nbTravelers - (deal.value.promoChildren || 80) * deal.value.nbUnderAge - (deal.value.promoTeen || 80) * deal.value.nbTeen
// })

const submitStepData = async () => {
  // Validate form
  if (!dealId.value || !model.value) return false
  const dealData = {
    dealId: dealId.value,
    specialRequest: `Préférence alimentaire: ${foodPreferences.value}`,
    indivRoom: indivRoom.value ? ['Oui'] : ['Non'],
    indivRoomPrice: indivRoomPrice.value,
    pricePerTraveler: pricePerTraveler.value,
    currentStep: 'A choisi ses options',
    totalTravelPrice: totalTravelPrice.value,
  }

  try {
    return await updateDeal(dealData)
  }
  catch (error) {
    console.log('error updating Options', error)
  }
}

defineExpose({
  submitStepData,
})
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
