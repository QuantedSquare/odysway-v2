<template>
  <v-skeleton-loader
    v-if="!dealId"
    type="card"
  />
  <v-container v-else>
    <!-- <v-row v-if="voyage.indiv_room && !forcedIndivRoom"> -->
    <v-row v-if="props.voyage && props.voyage.gotIndivRoomAvailable && indivRoomPrice > 0">
      <v-col cols="12">
        <h2>{{ page.room_indiv_title }}</h2>
      </v-col>
      <!-- :label="$t('stepperDevisGroup.roomIndivLabel')" -->
      <v-col
        cols="8"
        :class="indivRoom ? 'text-primary' : 'text-grey'"
      >
        <v-switch
          v-model="indivRoom"
          label="Je souhaite bénéficier d'une chambre individuelle"
        />
        <FunnelStepsDialogLearnMore
          :btn-text="page.room_indiv_accroche"
          :dialog-text="page.room_indiv_text"
        />
      </v-col>
      <v-col
        class="d-flex justify-end align-start text-body-1 "
        :class="indivRoom ? 'text-primary' : 'text-grey'"
      >
        + {{ formatNumber(indivRoomPrice, 'currency', '€') }} / pers.
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <h2 class="h2-option">
          {{ page.food_details_title }}
        </h2>
      </v-col>
      <v-col
        cols="12"
        md="6"
        class="d-flex justify-start align-center"
      >
        <v-switch
          v-model="vegeOption"
          :sub-label="options.vege_sub_label"
        >
          <template #label>
            <div class="d-flex flex-column align-start">
              <span>{{ options.food_prefs_label }}</span>
              <span class="text-caption">{{ options.vege_sub_label }}</span>
            </div>
          </template>
        </v-switch>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <!-- :label="$t('stepperDevisGroup.foodOptions.other')" -->
        <v-switch
          v-model="otherFoodOption"
          :label="options.other_food_label"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <!-- :label="$t('stepperDevisGroup.foodOptions.spec')" -->
        <Transition name="slide-fade">
          <v-textarea
            v-if="otherFoodOption"
            v-model="specialRequest"
            variant="outlined"
            :label="options.special_request_label"
          />
        </Transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const props = defineProps(['page', 'voyage', 'currentStep', 'ownStep', 'options'])
const { deal, dealId, updateDeal, loadingDeal } = useStepperDeal(props.ownStep)
const { addSingleParam } = useParams()
console.log('props.voyage', props.voyage)
const specialRequest = ref('')
const indivRoom = ref(false)
const indivRoomPrice = ref(0) // Checker si on veut afficher ce prix

const vegeOption = ref(false)
const otherFoodOption = ref(false)

const model = defineModel()
model.value = false

watch([loadingDeal, deal, () => props.currentStep], ([loading, dealVal, currentStep]) => {
  if (loading) {
    model.value = false
    return
  }
  if (dealId.value && dealVal) {
    indivRoomPrice.value = +dealVal.indivRoomPrice
    indivRoom.value = dealVal.indivRoom?.includes('Oui')
    vegeOption.value = dealVal.specialRequest?.includes('Régimes alimentaires spécifiques')
    otherFoodOption.value = dealVal.specialRequest?.includes('Autres demandes particulières')
    specialRequest.value = dealVal.specialRequest?.match(/Autres demandes particulières :(.*)/)?.[1].trim()
    model.value = true
  }
  else {
    model.value = false
  }
  if (currentStep === props.ownStep) {
    addSingleParam('step', props.ownStep)
  }
}, { immediate: true })

const foodPreferences = computed(() => {
  const foodPreferences = [
    vegeOption.value ? 'Régimes alimentaires spécifiques' : '',
    otherFoodOption.value ? 'Autres demandes particulières' : '',
  ]
  return `${foodPreferences.join(', ')} : ${specialRequest.value}`
})

const submitStepData = async () => {
  // Validate form
  if (!dealId.value || !deal.value || !model.value) return false
  const dealData = {
    dealId: dealId.value,
    specialRequest: `Préférence alimentaire: ${foodPreferences.value}`,
    indivRoom: indivRoom.value ? ['Oui'] : ['Non'],
    currentStep: 'A choisi ses options',
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
